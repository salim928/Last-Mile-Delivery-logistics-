"""
Riders API endpoints. 
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy. orm import Session
from pydantic import BaseModel, Field
from werkzeug.security import generate_password_hash

from app.database import get_db
from app.models.merchant import Merchant
from app.models.rider import Rider, RiderStatus
from app.services.auth import get_current_merchant

router = APIRouter(prefix="/riders", tags=["Riders"])


class RiderCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone_number: str = Field(..., pattern=r"^\+?[\d\s-]{10,20}$")
    email: str | None = None
    vehicle_type: str = "motorbike"
    vehicle_registration: str | None = None


class RiderResponse(BaseModel):
    id: int
    merchant_id: int
    name:  str
    phone_number: str
    email: str | None
    vehicle_type: str
    vehicle_registration: str | None
    status: RiderStatus
    is_active: bool
    total_deliveries: int
    successful_deliveries: int
    average_rating: float
    
    class Config:
        from_attributes = True


class RiderUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    vehicle_type: str | None = None
    status: RiderStatus | None = None
    is_active: bool | None = None


class SetPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


@router.post("", response_model=RiderResponse, status_code=status.HTTP_201_CREATED)
async def create_rider(
    rider_data: RiderCreate,
    db: Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Create a new rider."""
    existing = db.query(Rider).filter(Rider.phone_number == rider_data.phone_number).first()
    if existing:
        raise HTTPException(
            status_code=status. HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    rider = Rider(
        merchant_id=current_merchant.id,
        **rider_data.model_dump()
    )
    
    db.add(rider)
    db.commit()
    db.refresh(rider)
    
    return RiderResponse.model_validate(rider)


@router.get("", response_model=List[RiderResponse])
async def list_riders(
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """List all riders for the current merchant."""
    riders = db.query(Rider).filter(
        Rider.merchant_id == current_merchant.id
    ).all()
    
    return [RiderResponse.model_validate(r) for r in riders]


@router.get("/{rider_id}", response_model=RiderResponse)
async def get_rider(
    rider_id: int,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get a specific rider."""
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.merchant_id == current_merchant.id
    ).first()
    
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found"
        )
    
    return RiderResponse.model_validate(rider)


@router.patch("/{rider_id}", response_model=RiderResponse)
async def update_rider(
    rider_id: int,
    update_data: RiderUpdate,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Update a rider."""
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.merchant_id == current_merchant.id
    ).first()
    
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(rider, key, value)
    
    db.commit()
    db.refresh(rider)
    
    return RiderResponse.model_validate(rider)


@router.delete("/{rider_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rider(
    rider_id: int,
    db:  Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Delete a rider."""
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.merchant_id == current_merchant.id
    ).first()
    
    if not rider: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found"
        )
    
    db.delete(rider)
    db.commit()


@router.post("/{rider_id}/set-pin")
async def set_rider_pin(
    rider_id: int,
    pin_data: SetPinRequest,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Set or reset a rider's PIN (merchant only)."""
    rider = db.query(Rider).filter(
        Rider.id == rider_id,
        Rider.merchant_id == current_merchant.id
    ).first()
    
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rider not found"
        )
    
    # Hash and store the PIN
    rider.pin_hash = generate_password_hash(pin_data.pin)
    db.commit()
    
    return {"message": f"PIN set successfully for {rider.name}"}