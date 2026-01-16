"""
Proof of Delivery schemas. 
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PODCreate(BaseModel):
    order_id: int
    photo_base64: Optional[str] = None
    otp_code: Optional[str] = Field(None, min_length=4, max_length=6)
    recipient_name: Optional[str] = None
    recipient_signature: Optional[str] = None  # Base64 signature
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    cod_amount_collected:  float = 0.0
    cod_payment_method: Optional[str] = None
    notes: Optional[str] = None
    failure_reason: Optional[str] = None


class PODResponse(BaseModel):
    id: int
    order_id: int
    rider_id: int
    photo_url: Optional[str]
    otp_verified: Optional[datetime]
    recipient_name: Optional[str]
    delivery_latitude: Optional[float]
    delivery_longitude: Optional[float]
    cod_amount_collected: float
    cod_payment_method: Optional[str]
    notes: Optional[str]
    failure_reason: Optional[str]
    captured_at: datetime
    
    class Config:
        from_attributes = True


class OTPVerifyRequest(BaseModel):
    order_id: int
    otp_code: str = Field(..., min_length=4, max_length=6)


class OTPGenerateResponse(BaseModel):
    order_id: int
    otp_sent: bool
    message: str