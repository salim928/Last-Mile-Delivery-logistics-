"""
Authentication API endpoints.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.merchant import Merchant
from app.schemas.merchant import (
    MerchantCreate, MerchantResponse, MerchantLogin, Token
)
from app.services.auth import (
    get_password_hash, authenticate_merchant,
    create_access_token, get_current_merchant
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_merchant(
    merchant_data: MerchantCreate,
    db: Session = Depends(get_db)
):
    """Register a new merchant account."""
    # Check if email exists
    existing = db.query(Merchant).filter(Merchant.email == merchant_data. email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create merchant
    merchant = Merchant(
        email=merchant_data.email,
        hashed_password=get_password_hash(merchant_data.password),
        business_name=merchant_data.business_name,
        business_type=merchant_data.business_type,
        phone_number=merchant_data.phone_number,
        city=merchant_data.city,
        address=merchant_data.address,
        trial_ends_at=datetime.utcnow() + timedelta(days=14),  # 2-week trial
        subscription_status="trial"
    )
    
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    
    # Create access token
    access_token = create_access_token(data={"sub": merchant.id})
    
    return Token(
        access_token=access_token,
        merchant=MerchantResponse.model_validate(merchant)
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password."""
    merchant = authenticate_merchant(db, form_data.username, form_data.password)
    
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": merchant. id})
    
    return Token(
        access_token=access_token,
        merchant=MerchantResponse.model_validate(merchant)
    )


@router.get("/me", response_model=MerchantResponse)
async def get_current_merchant_info(
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Get current authenticated merchant info."""
    return MerchantResponse.model_validate(current_merchant)