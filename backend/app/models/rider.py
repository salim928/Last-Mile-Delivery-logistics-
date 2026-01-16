"""
Rider model - delivery personnel.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class RiderStatus(str, enum.Enum):
    AVAILABLE = "available"
    ON_ROUTE = "on_route"
    OFFLINE = "offline"


class Rider(Base):
    __tablename__ = "riders"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    
    # Profile
    name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False, unique=True)
    email = Column(String(255))
    
    # Authentication (simple PIN for riders)
    pin_hash = Column(String(255))
    
    # Vehicle
    vehicle_type = Column(String(50), default="motorbike")
    vehicle_registration = Column(String(50))
    
    # Status
    status = Column(SQLEnum(RiderStatus), default=RiderStatus.OFFLINE)
    is_active = Column(Boolean, default=True)
    
    # Current Location (for tracking)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    location_updated_at = Column(DateTime(timezone=True))
    
    # Statistics
    total_deliveries = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)
    failed_deliveries = Column(Integer, default=0)
    average_rating = Column(Float, default=5.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    merchant = relationship("Merchant", back_populates="riders")
    routes = relationship("Route", back_populates="rider")
    orders = relationship("Order", back_populates="rider")