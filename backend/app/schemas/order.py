"""
Order schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus, VehicleType


class OrderBase(BaseModel):
    external_order_id: Optional[str] = None
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., pattern=r"^\+?[\d\s-]{10,20}$")
    customer_email:  Optional[str] = None
    delivery_address: str = Field(... , min_length=5)
    delivery_city: str = "Accra"
    delivery_landmark: Optional[str] = None
    delivery_window_start:  Optional[datetime] = None
    delivery_window_end: Optional[datetime] = None
    preferred_vehicle: VehicleType = VehicleType.ANY
    package_description: Optional[str] = None
    package_weight_kg: float = Field(default=1.0, ge=0.1, le=100)
    package_size: Optional[str] = "medium"
    is_fragile:  bool = False
    is_cod: bool = False
    cod_amount: float = Field(default=0.0, ge=0)


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    status_notes: Optional[str] = None
    rider_id: Optional[int] = None
    cod_collected: Optional[float] = None


class OrderResponse(OrderBase):
    id: int
    merchant_id: int
    status: OrderStatus
    latitude: Optional[float]
    longitude: Optional[float]
    geocoding_confidence: Optional[float]
    route_id: Optional[int]
    route_stop_sequence: Optional[int]
    rider_id: Optional[int]
    estimated_delivery_time: Optional[datetime]
    actual_delivery_time: Optional[datetime]
    delivery_attempts: int
    cod_collected: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrderCSVRow(BaseModel):
    """Schema for CSV import validation."""
    external_order_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    delivery_address: str
    delivery_city: Optional[str] = "Accra"
    delivery_landmark: Optional[str] = None
    delivery_window_start:  Optional[str] = None
    delivery_window_end: Optional[str] = None
    is_cod: Optional[bool] = False
    cod_amount: Optional[float] = 0.0
    package_weight_kg: Optional[float] = 1.0
    notes: Optional[str] = None


class OrderBulkCreate(BaseModel):
    orders: List[OrderCreate]


class OrderBulkResponse(BaseModel):
    total_received: int
    total_created: int
    total_failed: int
    created_orders: List[OrderResponse]
    errors: List[dict]