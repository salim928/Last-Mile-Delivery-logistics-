"""
Orders API endpoints.
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
import csv
from io import StringIO

from app.database import get_db
from app.models.merchant import Merchant
from app.models.order import Order, OrderStatus
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderUpdate,
    OrderBulkCreate, OrderBulkResponse
)
from app.services.auth import get_current_merchant
from app.services.geocoding import geocoding_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Create a single order."""
    order = Order(
        merchant_id=current_merchant.id,
        **order_data.model_dump()
    )
    
    # Attempt geocoding
    geo_result = await geocoding_service.geocode(
        order_data.delivery_address,
        order_data.delivery_city
    )
    if geo_result:
        order. latitude, order.longitude, order.geocoding_confidence = geo_result
        order.delivery_address_normalized = geocoding_service.normalize_address(
            order_data.delivery_address, order_data.delivery_city
        )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    return OrderResponse.model_validate(order)


@router.post("/bulk", response_model=OrderBulkResponse)
async def create_orders_bulk(
    orders_data: OrderBulkCreate,
    db: Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Create multiple orders at once."""
    created_orders = []
    errors = []
    
    for idx, order_data in enumerate(orders_data.orders):
        try:
            order = Order(
                merchant_id=current_merchant.id,
                **order_data.model_dump()
            )
            
            # Geocode
            geo_result = await geocoding_service.geocode(
                order_data.delivery_address,
                order_data.delivery_city
            )
            if geo_result:
                order.latitude, order.longitude, order.geocoding_confidence = geo_result
            
            db.add(order)
            db.flush()
            created_orders.append(OrderResponse.model_validate(order))
        except Exception as e:
            errors.append({
                "index": idx,
                "error":  str(e),
                "data": order_data. model_dump()
            })
    
    db.commit()
    
    return OrderBulkResponse(
        total_received=len(orders_data.orders),
        total_created=len(created_orders),
        total_failed=len(errors),
        created_orders=created_orders,
        errors=errors
    )


@router.post("/upload-csv", response_model=OrderBulkResponse)
async def upload_orders_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Upload orders via CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    content = await file.read()
    csv_text = content.decode('utf-8')
    
    reader = csv.DictReader(StringIO(csv_text))
    
    created_orders = []
    errors = []
    
    for idx, row in enumerate(reader):
        try:
            # Map CSV columns to order fields
            order = Order(
                merchant_id=current_merchant.id,
                external_order_id=row.get('order_id') or row.get('external_order_id'),
                customer_name=row.get('customer_name', '').strip(),
                customer_phone=row.get('customer_phone', '').strip(),
                customer_email=row.get('customer_email'),
                delivery_address=row. get('delivery_address', '').strip(),
                delivery_city=row.get('delivery_city', 'Accra').strip(),
                delivery_landmark=row.get('landmark') or row.get('delivery_landmark'),
                is_cod=str(row.get('is_cod', 'false')).lower() in ['true', '1', 'yes'],
                cod_amount=float(row.get('cod_amount', 0) or 0),
                package_weight_kg=float(row.get('weight_kg', 1) or 1),
                package_description=row.get('notes') or row.get('package_description')
            )
            
            # Validate required fields
            if not order.customer_name or not order.customer_phone or not order.delivery_address:
                raise ValueError("Missing required fields:  customer_name, customer_phone, delivery_address")
            
            # Geocode
            geo_result = await geocoding_service. geocode(
                order.delivery_address,
                order.delivery_city
            )
            if geo_result:
                order. latitude, order.longitude, order. geocoding_confidence = geo_result
            
            db.add(order)
            db.flush()
            created_orders.append(OrderResponse.model_validate(order))
            
        except Exception as e:
            errors.append({
                "row": idx + 2,  # +2 for header and 0-index
                "error": str(e),
                "data": dict(row)
            })
    
    db.commit()
    
    return OrderBulkResponse(
        total_received=idx + 1,
        total_created=len(created_orders),
        total_failed=len(errors),
        created_orders=created_orders,
        errors=errors
    )


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    date_filter: Optional[date] = Query(None, alias="date"),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """List all orders for the current merchant."""
    query = db.query(Order).filter(Order.merchant_id == current_merchant.id)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    if date_filter:
        from sqlalchemy import func
        query = query.filter(func.date(Order.created_at) == date_filter)
    
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
    
    return [OrderResponse.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get a specific order by ID."""
    order = db. query(Order).filter(
        Order.id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    update_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Update an order."""
    order = db.query(Order).filter(
        Order. id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict. items():
        setattr(order, key, value)
    
    db.commit()
    db.refresh(order)
    
    return OrderResponse.model_validate(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db:  Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Delete an order (only if not assigned to a route)."""
    order = db. query(Order).filter(
        Order.id == order_id,
        Order.merchant_id == current_merchant.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status. HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.route_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete order assigned to a route"
        )
    
    db.delete(order)
    db.commit()