"""
Merchant model - businesses using the platform.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class BusinessType(str, enum.Enum):
    ECOMMERCE = "ecommerce"
    PHARMACY = "pharmacy"
    SUPERMARKET = "supermarket"
    SME = "sme"
    COURIER = "courier"
    OTHER = "other"


class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    business_name = Column(String(255), nullable=False)
    business_type = Column(SQLEnum(BusinessType), default=BusinessType.SME)
    phone_number = Column(String(20))
    city = Column(String(100), default="Accra")
    address = Column(String(500))
    
    # Settings
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Trial/Subscription
    trial_ends_at = Column(DateTime(timezone=True))
    subscription_status = Column(String(50), default="trial")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="merchant")
    routes = relationship("Route", back_populates="merchant")
    riders = relationship("Rider", back_populates="merchant")