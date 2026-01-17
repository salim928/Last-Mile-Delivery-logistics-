"""
Orders API views.
"""
import csv
import logging
from io import StringIO
from datetime import date
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Order, OrderStatus
from .serializers import (
    OrderCreateSerializer,
    OrderUpdateSerializer,
    OrderResponseSerializer,
    OrderBulkCreateSerializer,
    OrderBulkResponseSerializer
)
from apps.services.geocoding import geocoding_service

logger = logging.getLogger(__name__)


class OrderViewSet(viewsets.ViewSet):
    """ViewSet for order operations."""
    
    def list(self, request):
        """List all orders for the current merchant."""
        queryset = Order.objects.filter(merchant=request.merchant)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date
        date_filter = request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)
        
        # Pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        
        queryset = queryset.order_by('-created_at')[offset:offset + limit]
        
        serializer = OrderResponseSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a single order."""
        serializer = OrderCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        order = Order(
            merchant=request.merchant,
            **data
        )
        
        # Attempt geocoding
        geo_result = geocoding_service.geocode(
            data['delivery_address'],
            data.get('delivery_city', 'Accra')
        )
        if geo_result:
            order.latitude, order.longitude, order.geocoding_confidence = geo_result
            order.delivery_address_normalized = geocoding_service.normalize_address(
                data['delivery_address'],
                data.get('delivery_city', 'Accra')
            )
        
        order.save()
        
        # Create notification for new order
        try:
            from apps.notifications.models import Notification
            Notification.notify_order_created(order)
        except Exception as e:
            logger.warning(f"Failed to create order notification: {e}")
        
        return Response(
            OrderResponseSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, pk=None):
        """Get a specific order."""
        try:
            order = Order.objects.get(id=pk, merchant=request.merchant)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(OrderResponseSerializer(order).data)
    
    def partial_update(self, request, pk=None):
        """Update an order."""
        try:
            order = Order.objects.get(id=pk, merchant=request.merchant)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = OrderUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        for key, value in serializer.validated_data.items():
            setattr(order, key, value)
        
        order.save()
        
        return Response(OrderResponseSerializer(order).data)
    
    def destroy(self, request, pk=None):
        """Delete an order."""
        try:
            order = Order.objects.get(id=pk, merchant=request.merchant)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if order.route_id:
            return Response(
                {'detail': 'Cannot delete order that is assigned to a route'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def bulk(self, request):
        """Create multiple orders at once."""
        serializer = OrderBulkCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        created_orders = []
        errors = []
        
        with transaction.atomic():
            for idx, order_data in enumerate(serializer.validated_data['orders']):
                try:
                    order = Order(
                        merchant=request.merchant,
                        **order_data
                    )
                    
                    # Geocode
                    geo_result = geocoding_service.geocode(
                        order_data['delivery_address'],
                        order_data.get('delivery_city', 'Accra')
                    )
                    if geo_result:
                        order.latitude, order.longitude, order.geocoding_confidence = geo_result
                    
                    order.save()
                    created_orders.append(order)
                except Exception as e:
                    errors.append({
                        'index': idx,
                        'error': str(e),
                        'data': order_data
                    })
        
        return Response({
            'total_received': len(serializer.validated_data['orders']),
            'total_created': len(created_orders),
            'total_failed': len(errors),
            'created_orders': OrderResponseSerializer(created_orders, many=True).data,
            'errors': errors
        })
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_csv(self, request):
        """Upload orders via CSV file."""
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'detail': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not file.name.endswith('.csv'):
            return Response(
                {'detail': 'File must be a CSV'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        content = file.read().decode('utf-8')
        reader = csv.DictReader(StringIO(content))
        
        created_orders = []
        errors = []
        
        with transaction.atomic():
            for idx, row in enumerate(reader):
                try:
                    # Map CSV columns to order fields
                    customer_name = (row.get('customer_name') or '').strip()
                    customer_phone = (row.get('customer_phone') or '').strip()
                    delivery_address = (row.get('delivery_address') or '').strip()
                    
                    # Validate required fields
                    if not customer_name or not customer_phone or not delivery_address:
                        raise ValueError("Missing required fields: customer_name, customer_phone, delivery_address")
                    
                    order = Order(
                        merchant=request.merchant,
                        external_order_id=row.get('order_id') or row.get('external_order_id'),
                        customer_name=customer_name,
                        customer_phone=customer_phone,
                        customer_email=row.get('customer_email'),
                        delivery_address=delivery_address,
                        delivery_city=(row.get('delivery_city') or 'Accra').strip(),
                        delivery_landmark=row.get('landmark') or row.get('delivery_landmark'),
                        is_cod=str(row.get('is_cod', 'false')).lower() in ['true', '1', 'yes'],
                        cod_amount=float(row.get('cod_amount', 0) or 0),
                        package_weight_kg=float(row.get('weight_kg', 1) or 1),
                        package_description=row.get('notes') or row.get('package_description')
                    )
                    
                    # Geocode
                    geo_result = geocoding_service.geocode(
                        order.delivery_address,
                        order.delivery_city
                    )
                    if geo_result:
                        order.latitude, order.longitude, order.geocoding_confidence = geo_result
                    
                    order.save()
                    created_orders.append(order)
                    
                except Exception as e:
                    errors.append({
                        'row': idx + 2,  # +2 for header and 0-index
                        'error': str(e),
                        'data': dict(row)
                    })
        
        return Response({
            'total_received': idx + 1 if 'idx' in dir() else 0,
            'total_created': len(created_orders),
            'total_failed': len(errors),
            'created_orders': OrderResponseSerializer(created_orders, many=True).data,
            'errors': errors
        })
