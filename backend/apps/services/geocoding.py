"""
Geocoding service using free Nominatim (OpenStreetMap).
Includes rate limiting and caching for free tier compliance.
"""
import time
import re
import httpx
from typing import Optional, Tuple, Dict
from django.conf import settings

# Simple in-memory cache
_geocode_cache: Dict[str, Tuple[float, float, float]] = {}


class GeocodingService:
    def __init__(self):
        self.base_url = settings.NOMINATIM_URL
        self.user_agent = settings.NOMINATIM_USER_AGENT
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Nominatim requires 1 request/second max
    
    def _rate_limit(self):
        """Ensure we don't exceed Nominatim rate limits."""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()
    
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
            r"\bRd\b": "Road",
            r"\bAve\b": "Avenue",
            r"\bBlvd\b": "Boulevard",
            r"\bOpp\b": "Opposite",
            r"\bNr\b": "Near",
            r"\bBeh\b": "Behind",
        }
        
        for pattern, replacement in abbreviations.items():
            address = re.sub(pattern, replacement, address, flags=re.IGNORECASE)
        
        # Ensure city and country are included
        if city.lower() not in address.lower():
            address = f"{address}, {city}"
        if "ghana" not in address.lower():
            address = f"{address}, Ghana"
        
        return address
    
    def geocode(
        self,
        address: str,
        city: str = "Accra"
    ) -> Optional[Tuple[float, float, float]]:
        """
        Geocode an address to coordinates.
        Returns: (latitude, longitude, confidence) or None if not found.
        """
        normalized = self.normalize_address(address, city)
        
        # Check cache first
        cache_key = normalized.lower()
        if cache_key in _geocode_cache:
            return _geocode_cache[cache_key]
        
        self._rate_limit()
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.base_url}/search",
                    params={
                        "q": normalized,
                        "format": "json",
                        "limit": 1,
                        "countrycodes": "gh",  # Restrict to Ghana
                    },
                    headers={"User-Agent": self.user_agent},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    results = response.json()
                    if results:
                        result = results[0]
                        lat = float(result["lat"])
                        lon = float(result["lon"])
                        
                        # Calculate confidence based on result type
                        confidence = self._calculate_confidence(result)
                        
                        # Cache result
                        _geocode_cache[cache_key] = (lat, lon, confidence)
                        
                        return (lat, lon, confidence)
        
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    def _calculate_confidence(self, result: dict) -> float:
        """Calculate confidence score based on result type."""
        importance = float(result.get("importance", 0))
        result_type = result.get("type", "")
        
        # Higher confidence for more specific result types
        type_scores = {
            "house": 0.95,
            "building": 0.90,
            "residential": 0.85,
            "commercial": 0.85,
            "street": 0.70,
            "suburb": 0.60,
            "city": 0.50,
            "administrative": 0.40,
        }
        
        type_score = type_scores.get(result_type, 0.5)
        
        # Combine importance and type score
        confidence = (importance + type_score) / 2
        
        return round(min(confidence, 1.0), 2)
    
    def reverse_geocode(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[str]:
        """Get address from coordinates."""
        self._rate_limit()
        
        try:
            with httpx.Client() as client:
                response = client.get(
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
                    data = response.json()
                    return data.get("display_name")
        
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
        
        return None


# Singleton instance
geocoding_service = GeocodingService()
