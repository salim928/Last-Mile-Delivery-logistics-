"""
Route Optimization Service using OR-Tools (free, open-source).
Implements Vehicle Routing Problem (VRP) solver with constraints.
"""
from typing import List, Optional, Tuple, Dict
from dataclasses import dataclass
import math
import httpx
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from app.config import settings


@dataclass
class Location:
    id: int
    latitude: float
    longitude: float
    address: str
    time_window_start: Optional[int] = None  # Minutes from start of day
    time_window_end: Optional[int] = None
    service_time: int = 5  # Minutes at location


@dataclass
class OptimizedRoute:
    stop_sequence: List[int]  # Order IDs in optimized sequence
    total_distance_km: float
    total_duration_minutes: float
    stop_details: List[Dict]  # Details for each stop
    route_geometry: Optional[List[Tuple[float, float]]] = None


class RouteOptimizer: 
    def __init__(self):
        self.osrm_url = settings. OSRM_URL
    
    def _haversine_distance(
        self,
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> float:
        """Calculate distance between two points in kilometers."""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math. cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math. atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    async def _get_osrm_matrix(
        self,
        locations: List[Location]
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Get distance and duration matrix from OSRM. 
        Falls back to haversine distances if OSRM fails. 
        """
        coords = ";".join([f"{loc.longitude},{loc.latitude}" for loc in locations])
        
        try: 
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.osrm_url}/table/v1/driving/{coords}",
                    params={"annotations": "distance,duration"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data. get("code") == "Ok":
                        distances = data["distances"]  # meters
                        durations = data["durations"]  # seconds
                        
                        # Convert to km and minutes
                        distances_km = [[d / 1000 for d in row] for row in distances]
                        durations_min = [[d / 60 for d in row] for row in durations]
                        
                        return distances_km, durations_min
        except Exception as e: 
            print(f"OSRM error, falling back to haversine: {e}")
        
        # Fallback to haversine distances
        n = len(locations)
        distances_km = [[0.0] * n for _ in range(n)]
        durations_min = [[0.0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = self._haversine_distance(
                        locations[i].latitude, locations[i].longitude,
                        locations[j].latitude, locations[j].longitude
                    )
                    distances_km[i][j] = dist
                    # Estimate duration:  assume 25 km/h average speed in city
                    durations_min[i][j] = (dist / 25) * 60
        
        return distances_km, durations_min
    
    def _calculate_naive_route(
        self,
        locations: List[Location],
        distances_km: List[List[float]],
        durations_min:  List[List[float]]
    ) -> Tuple[float, float]:
        """Calculate distance/duration for naive (input order) route."""
        if len(locations) < 2:
            return 0.0, 0.0
        
        total_distance = 0.0
        total_duration = 0.0
        
        for i in range(len(locations) - 1):
            total_distance += distances_km[i][i + 1]
            total_duration += durations_min[i][i + 1]
            total_duration += locations[i + 1].service_time
        
        return total_distance, total_duration
    
    async def optimize(
        self,
        locations:  List[Location],
        depot_index: int = 0,
        return_to_depot: bool = False,
        vehicle_type: str = "motorbike"
    ) -> OptimizedRoute:
        """
        Optimize route using OR-Tools VRP solver.
        
        Args:
            locations: List of delivery locations (first should be depot/start)
            depot_index:  Index of starting location
            return_to_depot: Whether vehicle returns to start
            vehicle_type: 'motorbike' or 'van' for fuel calculations
        """
        if len(locations) < 2:
            # Single location, no optimization needed
            return OptimizedRoute(
                stop_sequence=[locations[0].id] if locations else [],
                total_distance_km=0.0,
                total_duration_minutes=0.0,
                stop_details=[]
            )
        
        # Get distance/duration matrix
        distances_km, durations_min = await self._get_osrm_matrix(locations)
        
        # Calculate naive route for comparison
        naive_distance, naive_duration = self._calculate_naive_route(
            locations, distances_km, durations_min
        )
        
        # Convert to integers for OR-Tools (multiply by 100 for precision)
        distance_matrix = [[int(d * 100) for d in row] for row in distances_km]
        time_matrix = [[int(t * 100) for t in row] for row in durations_min]
        
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(
            len(locations),
            1,  # Single vehicle
            depot_index
        )
        routing = pywrapcp.RoutingModel(manager)
        
        # Distance callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add time dimension for time windows
        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            travel_time = time_matrix[from_node][to_node]
            service_time = int(locations[to_node].service_time * 100)
            return travel_time + service_time
        
        time_callback_index = routing.RegisterTransitCallback(time_callback)
        
        routing.AddDimension(
            time_callback_index,
            30 * 100,  # 30 min slack
            24 * 60 * 100,  # Max time:  24 hours
            False,
            "Time"
        )
        time_dimension = routing.GetDimensionOrDie("Time")
        
        # Add time windows if specified
        for i, loc in enumerate(locations):
            if loc.time_window_start is not None and loc.time_window_end is not None:
                index = manager.NodeToIndex(i)
                time_dimension.CumulVar(index).SetRange(
                    int(loc.time_window_start * 100),
                    int(loc.time_window_end * 100)
                )
        
        # Search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters. first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters. local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit. seconds = 30  # Max 30 seconds
        
        # Solve
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution: 
            # Extract solution
            route_indices = []
            stop_details = []
            index = routing.Start(0)
            total_distance = 0.0
            total_duration = 0.0
            
            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                route_indices.append(node)
                
                # Get cumulative time
                time_var = time_dimension.CumulVar(index)
                arrival_time = solution.Min(time_var) / 100
                
                stop_details.append({
                    "sequence": len(stop_details),
                    "location_id": locations[node].id,
                    "latitude": locations[node].latitude,
                    "longitude": locations[node].longitude,
                    "address": locations[node].address,
                    "estimated_arrival_minutes": arrival_time,
                    "service_time_minutes": locations[node].service_time
                })
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                
                if not routing.IsEnd(index):
                    prev_node = manager.IndexToNode(previous_index)
                    next_node = manager.IndexToNode(index)
                    total_distance += distances_km[prev_node][next_node]
                    total_duration += durations_min[prev_node][next_node]
                    total_duration += locations[next_node].service_time
            
            # Add distance/duration from previous for each stop
            for i in range(1, len(stop_details)):
                prev_node = route_indices[i - 1]
                curr_node = route_indices[i]
                stop_details[i]["distance_from_previous_km"] = distances_km[prev_node][curr_node]
                stop_details[i]["duration_from_previous_minutes"] = durations_min[prev_node][curr_node]
            
            stop_sequence = [locations[i].id for i in route_indices]
            
            return OptimizedRoute(
                stop_sequence=stop_sequence,
                total_distance_km=round(total_distance, 2),
                total_duration_minutes=round(total_duration, 1),
                stop_details=stop_details,
            )
        else:
            # No solution found, return locations in original order
            stop_sequence = [loc.id for loc in locations]
            return OptimizedRoute(
                stop_sequence=stop_sequence,
                total_distance_km=round(naive_distance, 2),
                total_duration_minutes=round(naive_duration, 1),
                stop_details=[{
                    "sequence": i,
                    "location_id": loc.id,
                    "latitude": loc.latitude,
                    "longitude": loc.longitude,
                    "address": loc.address,
                } for i, loc in enumerate(locations)]
            )
    
    def calculate_fuel_cost(
        self,
        distance_km: float,
        vehicle_type: str = "motorbike"
    ) -> float:
        """Calculate estimated fuel cost in GHS."""
        if vehicle_type == "van":
            consumption = settings.VAN_FUEL_CONSUMPTION
        else:
            consumption = settings.MOTORBIKE_FUEL_CONSUMPTION
        
        liters_needed = distance_km * consumption
        cost = liters_needed * settings. FUEL_PRICE_PER_LITER
        return round(cost, 2)


# Singleton
route_optimizer = RouteOptimizer()