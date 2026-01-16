"""
Route schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.route import RouteStatus


class RouteStopResponse(BaseModel):
    id: int
    order_id: int
    sequence: int
    latitude: float
    longitude: float
    address: Optional[str]
    estimated_arrival: Optional[datetime]
    actual_arrival:  Optional[datetime]
    distance_from_previous_km: Optional[float]
    duration_from_previous_minutes:  Optional[float]
    status:  str
    
    # Order details for display
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    is_cod: Optional[bool] = None
    cod_amount: Optional[float] = None
    
    class Config:
        from_attributes = True


class RouteCreate(BaseModel):
    name: Optional[str] = None
    route_date: date
    vehicle_type: str = "motorbike"
    order_ids: List[int] = Field(... , min_length=1)
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None
    start_address: Optional[str] = None


class RouteUpdate(BaseModel):
    name: Optional[str] = None
    rider_id: Optional[int] = None
    status: Optional[RouteStatus] = None


class RouteOptimizeRequest(BaseModel):
    """Request to optimize a route."""
    route_id: int
    return_to_start: bool = False


class RouteResponse(BaseModel):
    id: int
    merchant_id: int
    rider_id: Optional[int]
    name: Optional[str]
    route_date: date
    vehicle_type:  str
    status: RouteStatus
    total_stops:  int
    total_distance_km: float
    total_duration_minutes: float
    estimated_fuel_cost: float
    
    # Savings metrics
    naive_distance_km: Optional[float]
    naive_duration_minutes:  Optional[float]
    distance_saved_km: Optional[float]
    distance_saved_percent:  Optional[float]
    time_saved_minutes: Optional[float]
    fuel_cost_saved:  Optional[float]
    
    # COD
    total_cod_expected: float
    total_cod_collected:  float
    
    # Timestamps
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    
    # Stops
    stops: List[RouteStopResponse] = []
    
    class Config: 
        from_attributes = True


class RouteAssignRequest(BaseModel):
    """Request to assign a rider to a route."""
    rider_id: int


class RouteSavingsReport(BaseModel):
    """ROI/Savings report for a route or period."""
    route_id: Optional[int]
    period_start: Optional[date]
    period_end: Optional[date]
    
    # Distance metrics
    total_optimized_distance_km: float
    total_naive_distance_km: float
    distance_saved_km: float
    distance_saved_percent: float
    
    # Time metrics
    total_optimized_duration_minutes: float
    total_naive_duration_minutes: float
    time_saved_minutes:  float
    time_saved_percent: float
    
    # Cost metrics
    estimated_fuel_cost_optimized: float
    estimated_fuel_cost_naive: float
    fuel_cost_saved: float
    
    # Delivery metrics
    total_deliveries: int
    successful_deliveries: int
    failed_deliveries: int
    success_rate_percent: float
    
    # COD metrics
    total_cod_expected: float
    total_cod_collected: float
    cod_collection_rate: float