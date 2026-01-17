"""
Routes API views.
"""
import csv
from io import BytesIO, StringIO
from django.http import HttpResponse
from django.utils import timezone
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from .models import Route, RouteStop, RouteStatus
from .serializers import (
    RouteCreateSerializer,
    RouteUpdateSerializer,
    RouteResponseSerializer,
    RouteAssignSerializer
)
from apps.orders.models import Order, OrderStatus
from apps.riders.models import Rider, RiderStatus
from apps.services.route_optimizer import route_optimizer, Location


class RouteViewSet(viewsets.ViewSet):
    """ViewSet for route operations."""
    
    def list(self, request):
        """List all routes for the current merchant."""
        queryset = Route.objects.filter(merchant=request.merchant).prefetch_related('stops', 'stops__order')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date
        date_filter = request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(route_date=date_filter)
        
        # Filter by rider
        rider_id = request.query_params.get('rider_id')
        if rider_id:
            queryset = queryset.filter(rider_id=rider_id)
        
        serializer = RouteResponseSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new route with specified orders."""
        serializer = RouteCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        order_ids = data['order_ids']
        
        # Validate orders belong to merchant and are available
        orders = Order.objects.filter(
            id__in=order_ids,
            merchant=request.merchant
        )
        
        if orders.count() != len(order_ids):
            return Response(
                {'detail': "Some orders not found or don't belong to you"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check orders aren't already on a route
        for order in orders:
            if order.route_id:
                return Response(
                    {'detail': f"Order {order.id} is already assigned to route {order.route_id}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not order.latitude or not order.longitude:
                return Response(
                    {'detail': f"Order {order.id} has not been geocoded"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate COD total
        total_cod = sum(o.cod_amount for o in orders if o.is_cod)
        
        with transaction.atomic():
            # Create route
            route = Route(
                merchant=request.merchant,
                name=data.get('name') or f"Route {data['route_date']}",
                route_date=data['route_date'],
                vehicle_type=data.get('vehicle_type', 'motorbike'),
                total_stops=len(orders),
                total_cod_expected=total_cod,
                start_latitude=data.get('start_latitude'),
                start_longitude=data.get('start_longitude'),
                start_address=data.get('start_address')
            )
            route.save()
            
            # Assign orders to route
            for order in orders:
                order.route = route
                order.save()
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(
            RouteResponseSerializer(route).data,
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, pk=None):
        """Get a specific route."""
        try:
            route = Route.objects.prefetch_related('stops', 'stops__order').get(
                id=pk,
                merchant=request.merchant
            )
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(RouteResponseSerializer(route).data)
    
    def partial_update(self, request, pk=None):
        """Update a route."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RouteUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        for key, value in serializer.validated_data.items():
            setattr(route, key, value)
        
        route.save()
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(RouteResponseSerializer(route).data)
    
    def destroy(self, request, pk=None):
        """Delete a route."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if route.status in [RouteStatus.IN_PROGRESS, RouteStatus.COMPLETED]:
            return Response(
                {'detail': 'Cannot delete route that is in progress or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Unassign orders
            Order.objects.filter(route=route).update(route=None, route_stop_sequence=None)
            route.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def optimize(self, request, pk=None):
        """Optimize a route using the route optimization engine."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return_to_start = request.query_params.get('return_to_start', 'false').lower() == 'true'
        
        # Get orders for this route
        orders = Order.objects.filter(route=route)
        
        if not orders.exists():
            return Response(
                {'detail': 'No orders on this route'},
                status=status.HTTP_400_BAD_REQUEST
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
                time_start = order.delivery_window_start.hour * 60 + order.delivery_window_start.minute
            if order.delivery_window_end:
                time_end = order.delivery_window_end.hour * 60 + order.delivery_window_end.minute
            
            locations.append(Location(
                id=order.id,
                latitude=order.latitude,
                longitude=order.longitude,
                address=order.delivery_address,
                time_window_start=time_start,
                time_window_end=time_end
            ))
        
        # Run optimization
        depot_index = 0 if (route.start_latitude and route.start_longitude) else 0
        result = route_optimizer.optimize(
            locations=locations,
            depot_index=depot_index,
            return_to_depot=return_to_start,
            vehicle_type=route.vehicle_type
        )
        
        # Calculate naive route for comparison
        naive_distance = 0
        naive_duration = 0
        for i in range(len(locations) - 1):
            dist = route_optimizer._haversine_distance(
                locations[i].latitude, locations[i].longitude,
                locations[i+1].latitude, locations[i+1].longitude
            )
            naive_distance += dist
            naive_duration += (dist / 25) * 60  # Assume 25 km/h
        
        with transaction.atomic():
            # Update route with optimization results
            route.total_distance_km = result.total_distance_km
            route.total_duration_minutes = result.total_duration_minutes
            route.naive_distance_km = round(naive_distance, 2)
            route.naive_duration_minutes = round(naive_duration, 1)
            route.distance_saved_km = round(naive_distance - result.total_distance_km, 2)
            route.distance_saved_percent = round(
                (naive_distance - result.total_distance_km) / naive_distance * 100
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
            route.save()
            
            # Clear existing stops and create new ones
            RouteStop.objects.filter(route=route).delete()
            
            for detail in result.stop_details:
                if detail["location_id"] == 0:  # Skip depot
                    continue
                
                stop = RouteStop(
                    route=route,
                    order_id=detail["location_id"],
                    sequence=detail["sequence"],
                    latitude=detail["latitude"],
                    longitude=detail["longitude"],
                    address=detail["address"],
                    distance_from_previous_km=detail.get("distance_from_previous"),
                    duration_from_previous_minutes=detail.get("duration_from_previous")
                )
                stop.save()
                
                # Update order sequence
                Order.objects.filter(id=detail["location_id"]).update(
                    route_stop_sequence=detail["sequence"]
                )
        
        # Create notification for route optimization
        try:
            from apps.notifications.models import Notification
            Notification.notify_route_optimized(route)
        except Exception as e:
            import logging
            logging.warning(f"Failed to create route optimization notification: {e}")
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(RouteResponseSerializer(route).data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign a rider to a route."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RouteAssignSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        rider_id = serializer.validated_data['rider_id']
        
        try:
            rider = Rider.objects.get(id=rider_id, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not rider.is_active:
            return Response(
                {'detail': 'Rider is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            route.rider = rider
            route.status = RouteStatus.ASSIGNED
            route.save()
            
            # Update orders
            Order.objects.filter(route=route).update(
                rider=rider,
                status=OrderStatus.ASSIGNED
            )
            
            # Update rider status
            rider.status = RiderStatus.ON_ROUTE
            rider.save()
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(RouteResponseSerializer(route).data)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a route."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not route.rider:
            return Response(
                {'detail': 'Route must have a rider assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        route.status = RouteStatus.IN_PROGRESS
        route.started_at = timezone.now()
        route.save()
        
        # Update orders to in_transit
        Order.objects.filter(route=route).update(status=OrderStatus.IN_TRANSIT)
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(RouteResponseSerializer(route).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a route."""
        try:
            route = Route.objects.get(id=pk, merchant=request.merchant)
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            route.status = RouteStatus.COMPLETED
            route.completed_at = timezone.now()
            
            # Calculate collected COD
            orders = Order.objects.filter(route=route, is_cod=True)
            route.total_cod_collected = sum(o.cod_collected or 0 for o in orders)
            route.save()
            
            # Update rider stats
            if route.rider:
                delivered = Order.objects.filter(route=route, status=OrderStatus.DELIVERED).count()
                failed = Order.objects.filter(route=route, status=OrderStatus.FAILED).count()
                
                route.rider.total_deliveries += delivered + failed
                route.rider.successful_deliveries += delivered
                route.rider.failed_deliveries += failed
                route.rider.status = RiderStatus.AVAILABLE
                route.rider.save()
        
        route = Route.objects.prefetch_related('stops', 'stops__order').get(id=route.id)
        return Response(RouteResponseSerializer(route).data)

    @action(detail=True, methods=['get'], url_path='export/pdf')
    def export_pdf(self, request, pk=None):
        """Export route as PDF."""
        try:
            route = Route.objects.prefetch_related('stops', 'stops__order').get(
                id=pk,
                merchant=request.merchant
            )
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        elements.append(Paragraph(f"Route: {route.name}", styles['Heading1']))
        elements.append(Paragraph(f"Date: {route.route_date}", styles['Normal']))
        elements.append(Paragraph(f"Rider: {route.rider.name if route.rider else 'Unassigned'}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Stops table
        stops = route.stops.select_related('order').order_by('sequence')
        if stops:
            data = [['#', 'Customer', 'Phone', 'Address', 'COD']]
            for stop in stops:
                order = stop.order
                data.append([
                    str(stop.sequence),
                    order.customer_name,
                    order.customer_phone,
                    order.delivery_address[:40] + '...' if len(order.delivery_address) > 40 else order.delivery_address,
                    f"GHS {order.cod_amount:.2f}" if order.is_cod else '-'
                ])
            
            table = Table(data, colWidths=[30, 100, 80, 180, 60])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(table)
        
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"Total Stops: {route.total_stops}", styles['Normal']))
        elements.append(Paragraph(f"Total COD Expected: GHS {route.total_cod_expected:.2f}", styles['Normal']))
        
        doc.build(elements)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="route_{route.id}.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='export/csv')
    def export_csv(self, request, pk=None):
        """Export route as CSV."""
        try:
            route = Route.objects.prefetch_related('stops', 'stops__order').get(
                id=pk,
                merchant=request.merchant
            )
        except Route.DoesNotExist:
            return Response(
                {'detail': 'Route not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="route_{route.id}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Sequence', 'Customer Name', 'Phone', 'Address', 'COD Amount', 'Status'])
        
        stops = route.stops.select_related('order').order_by('sequence')
        for stop in stops:
            order = stop.order
            writer.writerow([
                stop.sequence,
                order.customer_name,
                order.customer_phone,
                order.delivery_address,
                order.cod_amount if order.is_cod else 0,
                order.status
            ])
        
        return response
