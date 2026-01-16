"""
Geocoding service using free Nominatim (OpenStreetMap).
Includes rate limiting and caching for free tier compliance.
"""
import httpx
import asyncio
import random
from typing import Optional, Tuple, Dict
from functools import lru_cache
import re
from app.config import settings

# Simple in-memory cache
_geocode_cache: Dict[str, Tuple[float, float, float]] = {}

class GeocodingService:
    def __init__(self):
        self.base_url = settings.NOMINATIM_URL
        self.user_agent = settings.NOMINATIM_USER_AGENT
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Nominatim requires 1 request/second max
    
    async def _rate_limit(self):
        """Ensure we don't exceed Nominatim rate limits."""
        import time
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_request_interval:
            await asyncio. sleep(self.min_request_interval - elapsed)
        self.last_request_time = time. time()
    
    def normalize_address(self, address: str, city: str = "Accra") -> str:
        """
        Normalize Ghana addresses for better geocoding.
        Ghana addresses often use landmarks, which need special handling.
        """
        # Remove extra whitespace
        address = " ".join(address.split())
        
        # Common abbreviations
        abbreviations = {
            r"\bSt\b": "Street",
            r"\bRd\b":  "Road",
            r"\bAve\b": "Avenue",
            r"\bBlvd\b": "Boulevard",
            r"\bOpp\b": "Opposite",
            r"\bNr\b": "Near",
            r"\bBeh\b": "Behind",
        }
        
        for pattern, replacement in abbreviations.items():
            address = re.sub(pattern, replacement, address, flags=re.IGNORECASE)
        
        # Ensure city and country are included
        if city. lower() not in address.lower():
            address = f"{address}, {city}"
        if "ghana" not in address.lower():
            address = f"{address}, Ghana"
        
        return address
    
    async def geocode(
        self,
        address: str,
        city: str = "Accra"
    ) -> Optional[Tuple[float, float, float]]:
        """
        Geocode an address to coordinates.
        Returns:  (latitude, longitude, confidence) or None if not found. 
        """
        normalized = self.normalize_address(address, city)
        
        # Check cache first
        cache_key = normalized. lower()
        if cache_key in _geocode_cache: 
            return _geocode_cache[cache_key]
        
        await self._rate_limit()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/search",
                    params={
                        "q": normalized,
                        "format": "json",
                        "limit": 1,
                        "countrycodes": "gh",  # Restrict to Ghana
                    },
                    headers={"User-Agent":  self.user_agent},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    results = response.json()
                    if results:
                        result = results[0]
                        lat = float(result["lat"])
                        lon = float(result["lon"])
                        # Calculate confidence based on result type
                        importance = float(result.get("importance", 0.5))
                        confidence = min(importance, 1.0)
                        
                        # Cache the result
                        _geocode_cache[cache_key] = (lat, lon, confidence)
                        
                        return (lat, lon, confidence)
        except Exception as e:
            print(f"Geocoding error for '{address}': {e}")
        
        # Fallback to city center coordinates for Ghana cities
        city_coords = self._get_city_fallback(city)
        if city_coords:
            # Add small random offset to avoid all orders at exact same point
            lat_offset = random.uniform(-0.005, 0.005)  # ~500m offset
            lon_offset = random.uniform(-0.005, 0.005)
            return (city_coords[0] + lat_offset, city_coords[1] + lon_offset, 0.3)  # Low confidence
        
        return None
    
    def _get_city_fallback(self, city: str) -> Optional[Tuple[float, float]]:
        """Get fallback coordinates for Ghana cities."""
        city_centers = {
            "accra": (5.6037, -0.1870),
            "kumasi": (6.6885, -1.6244),
            "tamale": (9.4034, -0.8393),
            "takoradi": (4.8986, -1.7603),
            "sekondi": (4.9340, -1.7137),
            "cape coast": (5.1053, -1.2466),
            "tema": (5.6698, -0.0166),
            "koforidua": (6.0941, -0.2591),
            "sunyani": (7.3349, -2.3266),
            "ho": (6.6009, 0.4703),
            "wa": (10.0601, -2.5099),
            "bolgatanga": (10.7855, -0.8514),
            "east legon": (5.6350, -0.1520),
            "osu": (5.5550, -0.1830),
            "labone": (5.5680, -0.1710),
            "airport": (5.6052, -0.1668),
            "madina": (5.6822, -0.1661),
            "spintex": (5.6350, -0.0890),
            "dansoman": (5.5350, -0.2530),
            "lapaz": (5.6050, -0.2410),
            "circle": (5.5705, -0.2058),
        }
        
        city_lower = city.lower().strip()
        if city_lower in city_centers:
            return city_centers[city_lower]
        
        # Default to Accra if city not found
        return city_centers.get("accra")
    
    async def reverse_geocode(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[str]:
        """Convert coordinates back to address."""
        await self._rate_limit()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client. get(
                    f"{self.base_url}/reverse",
                    params={
                        "lat": latitude,
                        "lon": longitude,
                        "format": "json",
                    },
                    headers={"User-Agent": self.user_agent},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("display_name")
        except Exception as e: 
            print(f"Reverse geocoding error: {e}")
        
        return None
    
    async def batch_geocode(
        self,
        addresses: list[Tuple[int, str, str]]  # (order_id, address, city)
    ) -> Dict[int, Tuple[float, float, float]]:
        """
        Batch geocode multiple addresses. 
        Returns dict mapping order_id to (lat, lon, confidence).
        """
        results = {}
        for order_id, address, city in addresses:
            result = await self.geocode(address, city)
            if result: 
                results[order_id] = result
            # Rate limiting is handled in geocode()
        return results


# Singleton instance
geocoding_service = GeocodingService()