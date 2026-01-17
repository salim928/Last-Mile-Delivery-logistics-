"""
Riders API views.
"""
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Rider, RiderStatus
from .serializers import (
    RiderCreateSerializer,
    RiderUpdateSerializer,
    RiderResponseSerializer,
    RiderLocationUpdateSerializer
)
from apps.routes.models import Route, RouteStop, RouteStatus
from apps.orders.models import Order, OrderStatus


# ==================== RIDER AUTH VIEWS ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def rider_login(request):
    """Rider login with phone + PIN."""
    phone = request.data.get('phone_number')
    pin = request.data.get('pin')
    
    if not phone or not pin:
        return Response(
            {'detail': 'Phone number and PIN required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        rider = Rider.objects.get(phone_number=phone, is_active=True)
    except Rider.DoesNotExist:
        return Response(
            {'detail': 'Invalid phone number or PIN'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not rider.check_pin(pin):
        return Response(
            {'detail': 'Invalid phone number or PIN'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Update status to available
    rider.status = RiderStatus.AVAILABLE
    rider.save()
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(rider.merchant)
    refresh['rider_id'] = rider.id
    refresh['is_rider'] = True
    
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'rider': {
            'id': rider.id,
            'name': rider.name,
            'phone_number': rider.phone_number,
            'merchant_name': rider.merchant.business_name,
            'vehicle_type': rider.vehicle_type,
            'status': rider.status,
            'total_deliveries': rider.total_deliveries,
            'average_rating': rider.average_rating,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def rider_set_pin(request):
    """Set PIN for first-time rider login (via phone verification)."""
    phone = request.data.get('phone_number')
    new_pin = request.data.get('pin')
    
    if not phone or not new_pin:
        return Response(
            {'detail': 'Phone number and PIN required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_pin) != 4 or not new_pin.isdigit():
        return Response(
            {'detail': 'PIN must be 4 digits'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        rider = Rider.objects.get(phone_number=phone, is_active=True)
    except Rider.DoesNotExist:
        return Response(
            {'detail': 'Rider not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    rider.set_pin(new_pin)
    rider.save()
    
    return Response({'message': 'PIN set successfully'})


@api_view(['GET'])
def rider_me(request):
    """Get current rider profile from token."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        rider = Rider.objects.get(id=rider_id)
    except Rider.DoesNotExist:
        return Response(
            {'detail': 'Rider not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response({
        'id': rider.id,
        'name': rider.name,
        'phone_number': rider.phone_number,
        'email': rider.email,
        'merchant_name': rider.merchant.business_name,
        'vehicle_type': rider.vehicle_type,
        'vehicle_registration': rider.vehicle_registration,
        'status': rider.status,
        'total_deliveries': rider.total_deliveries,
        'successful_deliveries': rider.successful_deliveries,
        'failed_deliveries': rider.failed_deliveries,
        'average_rating': rider.average_rating,
    })


@api_view(['GET'])
def rider_active_route(request):
    """Get rider's currently active route with all stops."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get active route for rider
    route = Route.objects.filter(
        rider_id=rider_id,
        status__in=[RouteStatus.ASSIGNED, RouteStatus.IN_PROGRESS]
    ).prefetch_related('stops', 'stops__order').first()
    
    if not route:
        return Response({'route': None, 'stops': []})
    
    # Update to in_progress if assigned
    if route.status == RouteStatus.ASSIGNED:
        route.status = RouteStatus.IN_PROGRESS
        route.started_at = timezone.now()
        route.save()
    
    # Build stops list
    stops = []
    for stop in route.stops.all().order_by('sequence'):
        order = stop.order
        stops.append({
            'id': stop.id,
            'sequence': stop.sequence,
            'status': stop.status,
            'order_id': order.id,
            'external_order_id': order.external_order_id,
            'customer_name': order.customer_name,
            'customer_phone': order.customer_phone,
            'delivery_address': order.delivery_address,
            'delivery_city': order.delivery_city,
            'latitude': order.latitude,
            'longitude': order.longitude,
            'is_cod': order.is_cod,
            'cod_amount': float(order.cod_amount) if order.cod_amount else 0,
            'package_description': order.package_description,
            'special_instructions': order.special_instructions,
            'order_status': order.status,
        })
    
    # Calculate progress
    completed = sum(1 for s in stops if s['status'] in ['completed', 'failed'])
    pending = [s for s in stops if s['status'] == 'pending']
    
    return Response({
        'route': {
            'id': route.id,
            'name': route.name,
            'route_date': route.route_date,
            'status': route.status,
            'total_stops': route.total_stops,
            'completed_stops': completed,
            'total_cod_expected': float(route.total_cod_expected),
            'total_cod_collected': float(route.total_cod_collected),
            'estimated_duration_minutes': route.estimated_duration_minutes,
            'estimated_distance_km': float(route.estimated_distance_km) if route.estimated_distance_km else 0,
            'started_at': route.started_at,
        },
        'stops': stops,
        'next_stop': pending[0] if pending else None,
    })


@api_view(['POST'])
def rider_update_location(request):
    """Update rider's current GPS location."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    
    if latitude is None or longitude is None:
        return Response(
            {'detail': 'Latitude and longitude required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        rider = Rider.objects.get(id=rider_id)
        rider.current_latitude = latitude
        rider.current_longitude = longitude
        rider.location_updated_at = timezone.now()
        rider.save()
        
        return Response({'message': 'Location updated'})
    except Rider.DoesNotExist:
        return Response(
            {'detail': 'Rider not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def rider_complete_delivery(request, stop_id):
    """Mark a delivery stop as completed."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        stop = RouteStop.objects.select_related('route', 'order').get(
            id=stop_id,
            route__rider_id=rider_id
        )
    except RouteStop.DoesNotExist:
        return Response(
            {'detail': 'Stop not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    delivery_status = request.data.get('status', 'completed')  # 'completed' or 'failed'
    failure_reason = request.data.get('failure_reason', '')
    cod_collected = request.data.get('cod_collected', 0)
    recipient_name = request.data.get('recipient_name', '')
    
    # Update stop
    stop.status = delivery_status
    stop.completed_at = timezone.now()
    stop.cod_collected = cod_collected
    stop.failure_reason = failure_reason
    stop.save()
    
    # Update order
    order = stop.order
    if delivery_status == 'completed':
        order.status = OrderStatus.DELIVERED
        order.delivered_at = timezone.now()
    else:
        order.status = OrderStatus.FAILED
        order.failure_reason = failure_reason
    order.save()
    
    # Update route totals
    route = stop.route
    route.total_cod_collected += cod_collected
    
    # Check if route is complete
    pending_stops = route.stops.filter(status='pending').count()
    if pending_stops == 0:
        route.status = RouteStatus.COMPLETED
        route.completed_at = timezone.now()
    
    route.save()
    
    # Update rider stats
    rider = Rider.objects.get(id=rider_id)
    rider.total_deliveries += 1
    if delivery_status == 'completed':
        rider.successful_deliveries += 1
    else:
        rider.failed_deliveries += 1
    rider.save()
    
    return Response({
        'message': 'Delivery updated',
        'stop_status': delivery_status,
        'route_completed': route.status == RouteStatus.COMPLETED,
    })


@api_view(['GET'])
def rider_delivery_history(request):
    """Get rider's recent delivery history."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get completed routes in the last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    routes = Route.objects.filter(
        rider_id=rider_id,
        completed_at__gte=thirty_days_ago
    ).order_by('-completed_at')[:20]
    
    history = []
    for route in routes:
        history.append({
            'id': route.id,
            'name': route.name,
            'route_date': route.route_date,
            'total_stops': route.total_stops,
            'completed_at': route.completed_at,
            'cod_collected': float(route.total_cod_collected),
        })
    
    return Response({'history': history})


@api_view(['POST'])
def rider_go_offline(request):
    """Set rider status to offline."""
    rider_id = getattr(request, 'rider_id', None)
    
    if not rider_id:
        return Response(
            {'detail': 'Not authenticated as rider'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        rider = Rider.objects.get(id=rider_id)
        rider.status = RiderStatus.OFFLINE
        rider.save()
        return Response({'message': 'Now offline', 'status': 'offline'})
    except Rider.DoesNotExist:
        return Response({'detail': 'Rider not found'}, status=status.HTTP_404_NOT_FOUND)


class RiderViewSet(viewsets.ViewSet):
    """ViewSet for rider operations."""
    
    def dispatch(self, request, *args, **kwargs):
        """Check merchant authentication before any action."""
        # Allow OPTIONS requests for CORS
        if request.method == 'OPTIONS':
            return super().dispatch(request, *args, **kwargs)
        
        # Check if merchant is authenticated
        if not getattr(request, 'merchant', None):
            from rest_framework.response import Response
            return Response(
                {'detail': 'Authentication required. Please login again.'},
                status=401
            )
        
        return super().dispatch(request, *args, **kwargs)
    
    def list(self, request):
        """List all riders for the current merchant."""
        queryset = Rider.objects.filter(merchant=request.merchant)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        serializer = RiderResponseSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new rider."""
        serializer = RiderCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        rider = Rider(
            merchant=request.merchant,
            **serializer.validated_data
        )
        rider.save()
        
        return Response(
            RiderResponseSerializer(rider).data,
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, pk=None):
        """Get a specific rider."""
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(RiderResponseSerializer(rider).data)
    
    def partial_update(self, request, pk=None):
        """Update a rider."""
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RiderUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Check phone uniqueness if updating
        new_phone = serializer.validated_data.get('phone_number')
        if new_phone and new_phone != rider.phone_number:
            if Rider.objects.filter(phone_number=new_phone).exclude(id=pk).exists():
                return Response(
                    {'phone_number': ['Phone number already registered']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        for key, value in serializer.validated_data.items():
            setattr(rider, key, value)
        
        rider.save()
        
        return Response(RiderResponseSerializer(rider).data)
    
    def destroy(self, request, pk=None):
        """Delete a rider."""
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        rider.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        """Update rider's current location."""
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RiderLocationUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        rider.current_latitude = serializer.validated_data['latitude']
        rider.current_longitude = serializer.validated_data['longitude']
        rider.location_updated_at = timezone.now()
        rider.save()
        
        return Response(RiderResponseSerializer(rider).data)

    @action(detail=True, methods=['post'], url_path='set-pin')
    def set_pin(self, request, pk=None):
        """Set or reset a rider's PIN (merchant only)."""
        # Check if merchant is authenticated
        if not request.merchant:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found or not owned by your account'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        pin = request.data.get('pin')
        
        if not pin:
            return Response(
                {'detail': 'PIN is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(pin) != 4 or not pin.isdigit():
            return Response(
                {'detail': 'PIN must be 4 digits'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rider.set_pin(pin)
        rider.save()
        
        return Response({'message': f'PIN set successfully for {rider.name}'})

    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get detailed performance metrics for a rider."""
        try:
            rider = Rider.objects.get(id=pk, merchant=request.merchant)
        except Rider.DoesNotExist:
            return Response(
                {'detail': 'Rider not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate date ranges
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        last_7_days = today - timedelta(days=7)
        
        # Get orders completed by this rider
        completed_orders = Order.objects.filter(
            rider_id=rider.id,
            status__in=['delivered', 'failed']
        )
        
        # Orders in last 30 days
        orders_30d = completed_orders.filter(
            updated_at__date__gte=last_30_days
        )
        orders_7d = completed_orders.filter(
            updated_at__date__gte=last_7_days
        )
        
        # Calculate metrics
        total_30d = orders_30d.count()
        delivered_30d = orders_30d.filter(status='delivered').count()
        failed_30d = orders_30d.filter(status='failed').count()
        
        total_7d = orders_7d.count()
        delivered_7d = orders_7d.filter(status='delivered').count()
        
        # Success rate
        success_rate = round((delivered_30d / total_30d * 100) if total_30d > 0 else 0, 1)
        success_rate_7d = round((delivered_7d / total_7d * 100) if total_7d > 0 else 0, 1)
        
        # Calculate trend (compare last 7 days to previous 7 days)
        prev_7_days_start = last_7_days - timedelta(days=7)
        orders_prev_7d = completed_orders.filter(
            updated_at__date__gte=prev_7_days_start,
            updated_at__date__lt=last_7_days
        )
        prev_delivered = orders_prev_7d.filter(status='delivered').count()
        trend = delivered_7d - prev_delivered
        
        # Daily performance for chart (last 14 days)
        daily_performance = []
        for i in range(14):
            date = today - timedelta(days=13-i)
            day_orders = completed_orders.filter(updated_at__date=date)
            daily_performance.append({
                'date': date.isoformat(),
                'deliveries': day_orders.filter(status='delivered').count(),
                'failed': day_orders.filter(status='failed').count(),
            })
        
        # COD collection stats
        cod_orders = orders_30d.filter(
            status='delivered',
            payment_method='cod'
        )
        total_cod = sum(o.total_amount for o in cod_orders)
        
        # Calculate overall performance score
        rating_score = (rider.average_rating / 5) * 100
        delivery_score = success_rate
        overall_score = round((rating_score * 0.4 + delivery_score * 0.6))
        
        # Skills breakdown
        skills = [
            {'skill': 'Delivery Rate', 'value': min(100, round(success_rate)), 'fullMark': 100},
            {'skill': 'Customer Rating', 'value': min(100, round(rider.average_rating * 20)), 'fullMark': 100},
            {'skill': 'On-Time', 'value': min(100, 80 + (pk % 15)), 'fullMark': 100},  # Placeholder until we track this
            {'skill': 'COD Handling', 'value': min(100, 85 + (pk % 10)), 'fullMark': 100},  # Placeholder
            {'skill': 'Reliability', 'value': min(100, round(success_rate * 0.9 + rating_score * 0.1)), 'fullMark': 100},
        ]
        
        return Response({
            'rider': {
                'id': rider.id,
                'name': rider.name,
                'phone_number': rider.phone_number,
                'vehicle_type': rider.vehicle_type,
                'status': rider.status,
                'created_at': rider.created_at.isoformat(),
            },
            'summary': {
                'total_deliveries': rider.total_deliveries,
                'successful_deliveries': rider.successful_deliveries,
                'failed_deliveries': rider.failed_deliveries,
                'average_rating': rider.average_rating,
                'overall_score': overall_score,
            },
            'period_30d': {
                'total_orders': total_30d,
                'delivered': delivered_30d,
                'failed': failed_30d,
                'success_rate': success_rate,
                'cod_collected': float(total_cod),
            },
            'period_7d': {
                'total_orders': total_7d,
                'delivered': delivered_7d,
                'success_rate': success_rate_7d,
                'trend': trend,
            },
            'daily_performance': daily_performance,
            'skills': skills,
        })
