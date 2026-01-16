"""
Proof of Delivery API endpoints.
"""
import os
import uuid
import random
import string
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.merchant import Merchant
from app.models. order import Order, OrderStatus
from app.models.rider import Rider
from app.models.pod import ProofOfDelivery
from app.schemas.pod import PODCreate, PODResponse, OTPGenerateResponse
from app.services.auth import get_current_merchant
from app. services.notifications import notification_service
from app.config import settings

router = APIRouter(prefix="/pod", tags=["Proof of Delivery"])


def generate_otp(length: int = 4) -> str:
    """Generate random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


@router.post("/generate-otp/{order_id}", response_model=OTPGenerateResponse)
async def generate_delivery_otp(
    order_id: int,
    db:  Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Generate and send OTP to customer for delivery confirmation."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    otp_code = generate_otp()
    
    # Store OTP in POD record (create if doesn't exist)
    pod = db.query(ProofOfDelivery).filter(
        ProofOfDelivery.order_id == order_id
    ).first()
    
    if not pod:
        pod = ProofOfDelivery(
            order_id=order_id,
            rider_id=order.rider_id or 0
        )
        db.add(pod)
    
    pod.otp_code = otp_code
    db.commit()
    
    # Send OTP to customer
    result = await notification_service.send_otp(
        order.customer_phone,
        otp_code
    )
    
    return OTPGenerateResponse(
        order_id=order_id,
        otp_sent=result.get("success", False),
        message="OTP sent to customer" if result.get("success") else "Failed to send OTP (check logs)"
    )


@router.post("/verify-otp")
async def verify_delivery_otp(
    order_id: int,
    otp_code: str,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Verify OTP for delivery confirmation."""
    pod = db.query(ProofOfDelivery).filter(
        ProofOfDelivery.order_id == order_id
    ).first()
    
    if not pod or not pod.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP generated for this order"
        )
    
    if pod.otp_code != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    pod.otp_verified = datetime.utcnow()
    db.commit()
    
    return {"verified": True, "order_id": order_id}


@router.post("", response_model=PODResponse, status_code=status.HTTP_201_CREATED)
async def create_proof_of_delivery(
    pod_data: PODCreate,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Create proof of delivery record."""
    order = db.query(Order).filter(
        Order.id == pod_data.order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if POD already exists
    existing_pod = db.query(ProofOfDelivery).filter(
        ProofOfDelivery. order_id == pod_data. order_id
    ).first()
    
    if existing_pod and existing_pod.otp_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proof of delivery already submitted"
        )
    
    # Handle photo upload (base64)
    photo_path = None
    photo_url = None
    if pod_data.photo_base64:
        import base64
        
        os.makedirs(settings.POD_IMAGES_DIR, exist_ok=True)
        
        filename = f"{uuid.uuid4()}.jpg"
        photo_path = os.path.join(settings.POD_IMAGES_DIR, filename)
        
        try:
            image_data = base64.b64decode(pod_data.photo_base64)
            with open(photo_path, 'wb') as f:
                f.write(image_data)
            photo_url = f"/uploads/pod/{filename}"
        except Exception as e:
            print(f"Error saving photo: {e}")
    
    # Create or update POD
    if existing_pod:
        pod = existing_pod
    else: 
        pod = ProofOfDelivery(
            order_id=pod_data.order_id,
            rider_id=order.rider_id or 0
        )
        db.add(pod)
    
    pod.photo_path = photo_path
    pod.photo_url = photo_url
    pod.recipient_name = pod_data.recipient_name
    pod.recipient_signature = pod_data.recipient_signature
    pod.delivery_latitude = pod_data.delivery_latitude
    pod.delivery_longitude = pod_data.delivery_longitude
    pod.cod_amount_collected = pod_data.cod_amount_collected
    pod.cod_payment_method = pod_data.cod_payment_method
    pod. notes = pod_data.notes
    pod.failure_reason = pod_data.failure_reason
    pod.synced_at = datetime.utcnow()
    
    # Update order status and COD
    if pod_data.failure_reason:
        order.status = OrderStatus.FAILED
        order.status_notes = pod_data.failure_reason
        order.delivery_attempts += 1
    else:
        order.status = OrderStatus.DELIVERED
        order.actual_delivery_time = datetime.utcnow()
        order.cod_collected = pod_data.cod_amount_collected
        order.cod_collected_at = datetime.utcnow()
        
        # Update rider stats
        if order.rider_id:
            rider = db.query(Rider).filter(Rider.id == order.rider_id).first()
            if rider:
                rider.total_deliveries += 1
                rider. successful_deliveries += 1
    
    # Update route COD totals
    if order.route_id:
        from app.models.route import Route
        route = db.query(Route).filter(Route.id == order.route_id).first()
        if route:
            route. total_cod_collected = (route.total_cod_collected or 0) + (pod_data.cod_amount_collected or 0)
    
    db.commit()
    db.refresh(pod)
    
    # Send delivery confirmation to customer
    if not pod_data.failure_reason:
        await notification_service.send_delivery_confirmation(
            order.customer_phone,
            order.customer_name,
            order.external_order_id
        )
    
    return PODResponse. model_validate(pod)


@router.post("/upload-photo/{order_id}")
async def upload_pod_photo(
    order_id: int,
    photo:  UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Upload POD photo via multipart form."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Validate file type
    if not photo.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Save file
    os.makedirs(settings.POD_IMAGES_DIR, exist_ok=True)
    
    ext = photo.filename.split('.')[-1] if '.' in photo.filename else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    photo_path = os.path.join(settings.POD_IMAGES_DIR, filename)
    
    content = await photo.read()
    with open(photo_path, 'wb') as f:
        f.write(content)
    
    photo_url = f"/uploads/pod/{filename}"
    
    # Update or create POD
    pod = db.query(ProofOfDelivery).filter(
        ProofOfDelivery.order_id == order_id
    ).first()
    
    if not pod:
        pod = ProofOfDelivery(
            order_id=order_id,
            rider_id=order. rider_id or 0
        )
        db.add(pod)
    
    pod.photo_path = photo_path
    pod.photo_url = photo_url
    pod.delivery_latitude = latitude
    pod. delivery_longitude = longitude
    
    db.commit()
    
    return {"success": True, "photo_url": photo_url}


@router.get("/{order_id}", response_model=PODResponse)
async def get_proof_of_delivery(
    order_id: int,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get proof of delivery for an order."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    pod = db.query(ProofOfDelivery).filter(
        ProofOfDelivery.order_id == order_id
    ).first()
    
    if not pod: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No proof of delivery found"
        )
    
    return PODResponse.model_validate(pod)