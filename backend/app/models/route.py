"""
Route model - optimized delivery routes.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date,
    ForeignKey, Enum as SQLEnum, Text, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class RouteStatus(str, enum.Enum):
    DRAFT = "draft"
    OPTIMIZED = "optimized"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    
    # Route Info
    name = Column(String(255))
    route_date = Column(Date, nullable=False, index=True)
    vehicle_type = Column(String(50), default="motorbike")
    
    # Status
    status = Column(SQLEnum(RouteStatus), default=RouteStatus.DRAFT)
    
    # Optimization Results
    total_stops = Column(Integer, default=0)
    total_distance_km = Column(Float, default=0.0)
    total_duration_minutes = Column(Float, default=0.0)
    estimated_fuel_cost = Column(Float, default=0.0)
    
    # Comparison with naive route (for ROI calculation)
    naive_distance_km = Column(Float)
    naive_duration_minutes = Column(Float)
    distance_saved_km = Column(Float)
    distance_saved_percent = Column(Float)
    time_saved_minutes = Column(Float)
    fuel_cost_saved = Column(Float)
    
    # Route Geometry (for map display)
    route_geometry = Column(JSON)  # GeoJSON or polyline
    optimized_stop_order = Column(JSON)  # List of order IDs in optimized sequence
    
    # Start/End Points
    start_latitude = Column(Float)
    start_longitude = Column(Float)
    start_address = Column(String(500))
    end_latitude = Column(Float)
    end_longitude = Column(Float)
    end_address = Column(String(500))
    
    # Execution
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # COD Summary
    total_cod_expected = Column(Float, default=0.0)
    total_cod_collected = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func. now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    merchant = relationship("Merchant", back_populates="routes")
    rider = relationship("Rider", back_populates="routes")
    orders = relationship("Order", back_populates="route")
    stops = relationship("RouteStop", back_populates="route", order_by="RouteStop.sequence")


class RouteStop(Base):
    """Individual stops in a route with sequence and timing."""
    __tablename__ = "route_stops"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Sequence
    sequence = Column(Integer, nullable=False)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text)
    
    # Timing
    estimated_arrival = Column(DateTime(timezone=True))
    actual_arrival = Column(DateTime(timezone=True))
    service_time_minutes = Column(Integer, default=5)  # Time spent at stop
    
    # Distance from previous stop
    distance_from_previous_km = Column(Float)
    duration_from_previous_minutes = Column(Float)
    
    # Status
    status = Column(String(50), default="pending")
    
    # Relationships
    route = relationship("Route", back_populates="stops")