"""
Proof of Delivery model - delivery confirmation evidence.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ProofOfDelivery(Base):
    __tablename__ = "proof_of_delivery"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=False)
    
    # Photo Proof
    photo_url = Column(String(500))
    photo_path = Column(String(500))  # Local storage path
    
    # OTP Confirmation
    otp_code = Column(String(6))
    otp_verified = Column(DateTime(timezone=True))
    
    # Recipient Info
    recipient_name = Column(String(255))
    recipient_signature = Column(Text)  # Base64 encoded signature
    
    # Location at delivery
    delivery_latitude = Column(Float)
    delivery_longitude = Column(Float)
    
    # COD Collection
    cod_amount_collected = Column(Float, default=0.0)
    cod_payment_method = Column(String(50))  # cash, mobile_money
    
    # Notes
    notes = Column(Text)
    failure_reason = Column(String(255))  # If delivery failed
    
    # Timestamps
    captured_at = Column(DateTime(timezone=True), server_default=func.now())
    synced_at = Column(DateTime(timezone=True))  # When offline data was synced
    
    # Relationships
    order = relationship("Order", back_populates="proof_of_delivery")