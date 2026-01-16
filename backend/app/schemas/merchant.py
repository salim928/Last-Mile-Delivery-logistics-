"""
Merchant schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.merchant import BusinessType


class MerchantBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255)
    business_type: BusinessType = BusinessType.SME
    phone_number: Optional[str] = Field(None, pattern=r"^\+?[\d\s-]{10,20}$")
    city: str = "Accra"
    address:  Optional[str] = None


class MerchantCreate(MerchantBase):
    email: EmailStr
    password: str = Field(..., min_length=8)


class MerchantUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[BusinessType] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None


class MerchantResponse(MerchantBase):
    id: int
    email: str
    is_active: bool
    is_verified: bool
    subscription_status: str
    trial_ends_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class MerchantLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    merchant:  MerchantResponse


class TokenData(BaseModel):
    merchant_id: Optional[int] = None