"""
Order model - delivery orders from merchants.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    ForeignKey, Enum as SQLEnum, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETURNED = "returned"


class VehicleType(str, enum. Enum):
    MOTORBIKE = "motorbike"
    VAN = "van"
    ANY = "any"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    
    # Order Reference
    external_order_id = Column(String(100), index=True)  # Merchant's order ID
    
    # Customer Info
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(255))
    
    # Delivery Address
    delivery_address = Column(Text, nullable=False)
    delivery_address_normalized = Column(Text)
    delivery_city = Column(String(100), default="Accra")
    delivery_landmark = Column(String(255))  # Important for Ghana addresses
    
    # Geocoded Location
    latitude = Column(Float)
    longitude = Column(Float)
    geocoding_confidence = Column(Float)  # 0-1 confidence score
    
    # Delivery Constraints
    delivery_window_start = Column(DateTime(timezone=True))
    delivery_window_end = Column(DateTime(timezone=True))
    preferred_vehicle = Column(SQLEnum(VehicleType), default=VehicleType.ANY)
    
    # Package Info
    package_description = Column(Text)
    package_weight_kg = Column(Float, default=1.0)
    package_size = Column(String(50))  # small, medium, large
    is_fragile = Column(Boolean, default=False)
    
    # COD (Cash on Delivery)
    is_cod = Column(Boolean, default=False)
    cod_amount = Column(Float, default=0.0)
    cod_collected = Column(Float)
    cod_collected_at = Column(DateTime(timezone=True))
    
    # Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    status_notes = Column(Text)
    
    # Assignment
    route_id = Column(Integer, ForeignKey("routes.id"))
    route_stop_sequence = Column(Integer)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    
    # Delivery Tracking
    estimated_delivery_time = Column(DateTime(timezone=True))
    actual_delivery_time = Column(DateTime(timezone=True))
    delivery_attempts = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    merchant = relationship("Merchant", back_populates="orders")
    route = relationship("Route", back_populates="orders")
    rider = relationship("Rider", back_populates="orders")
    proof_of_delivery = relationship("ProofOfDelivery", back_populates="order", uselist=False)