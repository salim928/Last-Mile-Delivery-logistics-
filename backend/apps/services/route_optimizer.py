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
from django.conf import settings


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
        self.osrm_url = settings.OSRM_URL
    
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
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _get_osrm_matrix(
        self,
        locations: List[Location]
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Get distance and duration matrix from OSRM.
        Falls back to haversine distances if OSRM fails.
        """
        coords = ";".join([f"{loc.longitude},{loc.latitude}" for loc in locations])
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.osrm_url}/table/v1/driving/{coords}",
                    params={"annotations": "distance,duration"},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == "Ok":
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
                    # Estimate duration: assume 25 km/h average speed in city
                    durations_min[i][j] = (dist / 25) * 60
        
        return distances_km, durations_min
    
    def _calculate_naive_route(
        self,
        locations: List[Location],
        distances_km: List[List[float]],
        durations_min: List[List[float]]
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
    
    def optimize(
        self,
        locations: List[Location],
        depot_index: int = 0,
        return_to_depot: bool = False,
        vehicle_type: str = "motorbike"
    ) -> OptimizedRoute:
        """
        Optimize route using OR-Tools VRP solver.
        
        Args:
            locations: List of delivery locations (first should be depot/start)
            depot_index: Index of starting location
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
        distances_km, durations_min = self._get_osrm_matrix(locations)
        
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
            24 * 60 * 100,  # Max time: 24 hours
            False,
            "Time"
        )
        time_dimension = routing.GetDimensionOrDie("Time")
        
        # Add time windows if specified
        for idx, location in enumerate(locations):
            if location.time_window_start is not None and location.time_window_end is not None:
                index = manager.NodeToIndex(idx)
                time_dimension.CumulVar(index).SetRange(
                    int(location.time_window_start * 100),
                    int(location.time_window_end * 100)
                )
        
        # Search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 10  # 10 second time limit
        
        # Solve
        solution = routing.SolveWithParameters(search_parameters)
        
        if not solution:
            # Fallback to nearest neighbor if OR-Tools fails
            return self._nearest_neighbor_route(
                locations, distances_km, durations_min, depot_index
            )
        
        # Extract solution
        index = routing.Start(0)
        stop_sequence = []
        stop_details = []
        total_distance = 0.0
        total_duration = 0.0
        sequence = 0
        prev_index = index
        
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            location = locations[node]
            
            if node != depot_index or (node == depot_index and sequence == 0):
                # Calculate distance from previous
                prev_node = manager.IndexToNode(prev_index)
                dist_from_prev = distances_km[prev_node][node] if sequence > 0 else 0
                dur_from_prev = durations_min[prev_node][node] if sequence > 0 else 0
                
                stop_sequence.append(location.id)
                stop_details.append({
                    "sequence": sequence,
                    "location_id": location.id,
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "address": location.address,
                    "distance_from_previous": round(dist_from_prev, 2),
                    "duration_from_previous": round(dur_from_prev, 1)
                })
                
                total_distance += dist_from_prev
                total_duration += dur_from_prev + location.service_time
                sequence += 1
            
            prev_index = index
            index = solution.Value(routing.NextVar(index))
        
        return OptimizedRoute(
            stop_sequence=stop_sequence,
            total_distance_km=round(total_distance, 2),
            total_duration_minutes=round(total_duration, 1),
            stop_details=stop_details
        )
    
    def _nearest_neighbor_route(
        self,
        locations: List[Location],
        distances_km: List[List[float]],
        durations_min: List[List[float]],
        depot_index: int
    ) -> OptimizedRoute:
        """Simple nearest neighbor heuristic as fallback."""
        n = len(locations)
        visited = [False] * n
        route = [depot_index]
        visited[depot_index] = True
        current = depot_index
        
        for _ in range(n - 1):
            nearest = -1
            min_dist = float('inf')
            
            for j in range(n):
                if not visited[j] and distances_km[current][j] < min_dist:
                    min_dist = distances_km[current][j]
                    nearest = j
            
            if nearest != -1:
                route.append(nearest)
                visited[nearest] = True
                current = nearest
        
        # Build result
        stop_sequence = []
        stop_details = []
        total_distance = 0.0
        total_duration = 0.0
        
        for i, idx in enumerate(route):
            location = locations[idx]
            
            if i > 0:
                prev_idx = route[i - 1]
                dist_from_prev = distances_km[prev_idx][idx]
                dur_from_prev = durations_min[prev_idx][idx]
            else:
                dist_from_prev = 0
                dur_from_prev = 0
            
            stop_sequence.append(location.id)
            stop_details.append({
                "sequence": i,
                "location_id": location.id,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "address": location.address,
                "distance_from_previous": round(dist_from_prev, 2),
                "duration_from_previous": round(dur_from_prev, 1)
            })
            
            total_distance += dist_from_prev
            total_duration += dur_from_prev + location.service_time
        
        return OptimizedRoute(
            stop_sequence=stop_sequence,
            total_distance_km=round(total_distance, 2),
            total_duration_minutes=round(total_duration, 1),
            stop_details=stop_details
        )
    
    def calculate_fuel_cost(self, distance_km: float, vehicle_type: str = "motorbike") -> float:
        """Calculate fuel cost in GHS."""
        consumption = (
            settings.VAN_FUEL_CONSUMPTION
            if vehicle_type == "van"
            else settings.MOTORBIKE_FUEL_CONSUMPTION
        )
        
        liters_needed = distance_km * consumption
        cost = liters_needed * settings.FUEL_PRICE_PER_LITER
        
        return round(cost, 2)


# Singleton instance
route_optimizer = RouteOptimizer()
