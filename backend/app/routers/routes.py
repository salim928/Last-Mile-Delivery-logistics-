"""
Routes API endpoints - route creation and optimization.
"""
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from app.database import get_db
from app.models.merchant import Merchant
from app.models.order import Order, OrderStatus
from app.models.route import Route, RouteStop, RouteStatus
from app.models.rider import Rider
from app.schemas.route import (
    RouteCreate, RouteResponse, RouteUpdate,
    RouteOptimizeRequest, RouteAssignRequest, RouteStopResponse
)
from app.services.auth import get_current_merchant
from app.services.route_optimizer import route_optimizer, Location
from app.config import settings

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(
    route_data: RouteCreate,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Create a new route with specified orders."""
    # Validate orders belong to merchant and are available
    orders = db.query(Order).filter(
        Order.id.in_(route_data.order_ids),
        Order.merchant_id == current_merchant.id
    ).all()
    
    if len(orders) != len(route_data.order_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some orders not found or don't belong to you"
        )
    
    # Check orders aren't already on a route
    for order in orders:
        if order.route_id:
            raise HTTPException(
                status_code=status. HTTP_400_BAD_REQUEST,
                detail=f"Order {order.id} is already assigned to route {order.route_id}"
            )
        if not order.latitude or not order.longitude:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order {order.id} has not been geocoded"
            )
    
    # Calculate COD total
    total_cod = sum(o.cod_amount for o in orders if o.is_cod)
    
    # Create route
    route = Route(
        merchant_id=current_merchant.id,
        name=route_data.name or f"Route {route_data.route_date}",
        route_date=route_data.route_date,
        vehicle_type=route_data.vehicle_type,
        total_stops=len(orders),
        total_cod_expected=total_cod,
        start_latitude=route_data.start_latitude,
        start_longitude=route_data.start_longitude,
        start_address=route_data.start_address
    )
    
    db.add(route)
    db.flush()
    
    # Assign orders to route
    for order in orders:
        order. route_id = route.id
    
    db.commit()
    db.refresh(route)
    
    return RouteResponse.model_validate(route)


@router.post("/{route_id}/optimize", response_model=RouteResponse)
async def optimize_route(
    route_id: int,
    return_to_start: bool = Query(False),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Optimize a route using the route optimization engine."""
    route = db.query(Route).filter(
        Route.id == route_id,
        Route.merchant_id == current_merchant.id
    ).first()
    
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Get orders for this route
    orders = db.query(Order).filter(Order.route_id == route_id).all()
    
    if not orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No orders on this route"
        )
    
    # Build locations for optimizer
    locations = []
    
    # Add depot (start location) if specified
    if route.start_latitude and route.start_longitude:
        locations.append(Location(
            id=0,  # Depot
            latitude=route.start_latitude,
            longitude=route.start_longitude,
            address=route.start_address or "Depot"
        ))
    
    # Add order locations
    for order in orders: 
        time_start = None
        time_end = None
        
        if order.delivery_window_start:
            time_start = order.delivery_window_start. hour * 60 + order.delivery_window_start.minute
        if order.delivery_window_end:
            time_end = order. delivery_window_end.hour * 60 + order.delivery_window_end.minute
        
        locations.append(Location(
            id=order.id,
            latitude=order.latitude,
            longitude=order.longitude,
            address=order.delivery_address,
            time_window_start=time_start,
            time_window_end=time_end
        ))
    
    # Run optimization
    depot_index = 0 if (route.start_latitude and route. start_longitude) else 0
    result = await route_optimizer.optimize(
        locations=locations,
        depot_index=depot_index,
        return_to_depot=return_to_start,
        vehicle_type=route.vehicle_type
    )
    
    # Calculate naive route for comparison
    naive_distance = 0
    naive_duration = 0
    for i in range(len(locations) - 1):
        # Simple estimate
        from app.services.route_optimizer import RouteOptimizer
        opt = RouteOptimizer()
        dist = opt._haversine_distance(
            locations[i].latitude, locations[i].longitude,
            locations[i+1].latitude, locations[i+1].longitude
        )
        naive_distance += dist
        naive_duration += (dist / 25) * 60  # Assume 25 km/h
    
    # Update route with optimization results
    route.total_distance_km = result.total_distance_km
    route.total_duration_minutes = result.total_duration_minutes
    route.naive_distance_km = round(naive_distance, 2)
    route.naive_duration_minutes = round(naive_duration, 1)
    route.distance_saved_km = round(naive_distance - result.total_distance_km, 2)
    route.distance_saved_percent = round(
        (naive_distance - result. total_distance_km) / naive_distance * 100
        if naive_distance > 0 else 0, 1
    )
    route.time_saved_minutes = round(naive_duration - result.total_duration_minutes, 1)
    route.estimated_fuel_cost = route_optimizer.calculate_fuel_cost(
        result.total_distance_km, route.vehicle_type
    )
    route.fuel_cost_saved = route_optimizer.calculate_fuel_cost(
        naive_distance - result.total_distance_km, route.vehicle_type
    )
    route.optimized_stop_order = result.stop_sequence
    route.status = RouteStatus.OPTIMIZED
    
    # Clear existing stops and create new ones
    db.query(RouteStop).filter(RouteStop.route_id == route_id).delete()
    
    for detail in result.stop_details:
        if detail["location_id"] == 0:  # Skip depot
            continue
        
        stop = RouteStop(
            route_id=route_id,
            order_id=detail["location_id"],
            sequence=detail["sequence"],
            latitude=detail["latitude"],
            longitude=detail["longitude"],
            address=detail["address"],
            distance_from_previous_km=detail. get("distance_from_previous_km"),
            duration_from_previous_minutes=detail.get("duration_from_previous_minutes")
        )
        db.add(stop)
        
        # Update order sequence
        order = db.query(Order).filter(Order.id == detail["location_id"]).first()
        if order:
            order.route_stop_sequence = detail["sequence"]
    
    db.commit()
    db.refresh(route)
    
    # Load stops for response
    route_response = RouteResponse.model_validate(route)
    route_response.stops = [
        RouteStopResponse.model_validate(s) for s in 
        db.query(RouteStop).filter(RouteStop.route_id == route_id).order_by(RouteStop.sequence).all()
    ]
    
    return route_response


@router.get("", response_model=List[RouteResponse])
async def list_routes(
    date_filter: Optional[date] = Query(None, alias="date"),
    status_filter: Optional[RouteStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """List all routes for the current merchant."""
    query = db.query(Route).filter(Route.merchant_id == current_merchant.id)
    
    if date_filter:
        query = query.filter(Route.route_date == date_filter)
    
    if status_filter:
        query = query.filter(Route. status == status_filter)
    
    routes = query.order_by(Route.route_date.desc()).all()
    
    return [RouteResponse.model_validate(r) for r in routes]


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: int,
    db:  Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Get a specific route with all stops."""
    route = db. query(Route).filter(
        Route.id == route_id,
        Route.merchant_id == current_merchant.id
    ).first()
    
    if not route:
        raise HTTPException(
            status_code=status. HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    response = RouteResponse.model_validate(route)
    
    # Get stops with order details
    stops = db.query(RouteStop).filter(
        RouteStop.route_id == route_id
    ).order_by(RouteStop.sequence).all()
    
    stop_responses = []
    for stop in stops:
        order = db.query(Order).filter(Order.id == stop.order_id).first()
        stop_resp = RouteStopResponse.model_validate(stop)
        if order:
            stop_resp. customer_name = order.customer_name
            stop_resp.customer_phone = order.customer_phone
            stop_resp.is_cod = order.is_cod
            stop_resp.cod_amount = order.cod_amount
        stop_responses.append(stop_resp)
    
    response.stops = stop_responses
    
    return response


@router. post("/{route_id}/assign", response_model=RouteResponse)
async def assign_rider(
    route_id: int,
    assignment:  RouteAssignRequest,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Assign a rider to a route."""
    route = db. query(Route).filter(
        Route.id == route_id,
        Route.merchant_id == current_merchant.id
    ).first()
    
    if not route:
        raise HTTPException(
            status_code=status. HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    rider = db.query(Rider).filter(
        Rider.id == assignment.rider_id,
        Rider.merchant_id == current_merchant.id
    ).first()
    
    if not rider:
        raise HTTPException(
            status_code=status. HTTP_404_NOT_FOUND,
            detail="Rider not found"
        )
    
    route.rider_id = rider.id
    route.status = RouteStatus.ASSIGNED
    
    # Update all orders on route
    db.query(Order).filter(Order.route_id == route_id).update({
        Order.rider_id: rider.id,
        Order.status: OrderStatus.ASSIGNED
    })
    
    db.commit()
    db.refresh(route)
    
    return RouteResponse.model_validate(route)


@router.get("/{route_id}/export/pdf")
async def export_route_pdf(
    route_id: int,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Export route as PDF for printing."""
    route = db. query(Route).filter(
        Route.id == route_id,
        Route.merchant_id == current_merchant.id
    ).first()
    
    if not route:
        raise HTTPException(
            status_code=status. HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Generate simple PDF
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Header
    story.append(Paragraph(f"Route: {route. name}", styles['Heading1']))
    story.append(Paragraph(f"Date: {route. route_date}", styles['Normal']))
    story.append(Paragraph(f"Vehicle: {route.vehicle_type}", styles['Normal']))
    story.append(Paragraph(f"Total Distance: {route.total_distance_km} km", styles['Normal']))
    story.append(Paragraph(f"Estimated Time: {route.total_duration_minutes} min", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Stops table
    stops = db.query(RouteStop).filter(
        RouteStop. route_id == route_id
    ).order_by(RouteStop.sequence).all()
    
    table_data = [["#", "Customer", "Phone", "Address", "COD"]]
    
    for stop in stops:
        order = db.query(Order).filter(Order.id == stop.order_id).first()
        if order:
            table_data. append([
                str(stop.sequence),
                order.customer_name,
                order.customer_phone,
                order.delivery_address[: 40] + "..." if len(order.delivery_address) > 40 else order.delivery_address,
                f"GHS {order.cod_amount}" if order.is_cod else "-"
            ])
    
    table = Table(table_data, colWidths=[0.5*inch, 1.5*inch, 1.2*inch, 2. 5*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(table)
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=route_{route_id}.pdf"}
    )


@router.get("/{route_id}/export/csv")
async def export_route_csv(
    route_id: int,
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Export route as CSV."""
    route = db.query(Route).filter(
        Route. id == route_id,
        Route.merchant_id == current_merchant.id
    ).first()
    
    if not route: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Sequence", "Customer Name", "Phone", "Address", "Landmark", "COD Amount", "Status"])
    
    stops = db.query(RouteStop).filter(
        RouteStop.route_id == route_id
    ).order_by(RouteStop.sequence).all()
    
    for stop in stops: 
        order = db.query(Order).filter(Order.id == stop.order_id).first()
        if order:
            writer.writerow([
                stop. sequence,
                order.customer_name,
                order.customer_phone,
                order.delivery_address,
                order.delivery_landmark or "",
                order.cod_amount if order.is_cod else 0,
                order.status. value
            ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=route_{route_id}.csv"}
    )