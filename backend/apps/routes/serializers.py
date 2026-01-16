"""
Route serializers for request/response validation.
"""
from rest_framework import serializers
from .models import Route, RouteStop, RouteStatus


class RouteStopResponseSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    customer_phone = serializers.CharField(source='order.customer_phone', read_only=True)
    is_cod = serializers.BooleanField(source='order.is_cod', read_only=True)
    cod_amount = serializers.FloatField(source='order.cod_amount', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    
    class Meta:
        model = RouteStop
        fields = [
            'id', 'order_id', 'sequence', 'latitude', 'longitude',
            'address', 'estimated_arrival', 'actual_arrival',
            'distance_from_previous_km', 'duration_from_previous_minutes',
            'status', 'customer_name', 'customer_phone', 'is_cod', 'cod_amount',
            'order_status'
        ]


class RouteCreateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    route_date = serializers.DateField()
    vehicle_type = serializers.CharField(default='motorbike')
    order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    start_latitude = serializers.FloatField(required=False, allow_null=True)
    start_longitude = serializers.FloatField(required=False, allow_null=True)
    start_address = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class RouteUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    rider_id = serializers.IntegerField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=RouteStatus.choices, required=False)


class RouteResponseSerializer(serializers.ModelSerializer):
    stops = RouteStopResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = [
            'id', 'merchant_id', 'rider_id', 'name', 'route_date',
            'vehicle_type', 'status', 'total_stops', 'total_distance_km',
            'total_duration_minutes', 'estimated_fuel_cost',
            'naive_distance_km', 'naive_duration_minutes',
            'distance_saved_km', 'distance_saved_percent',
            'time_saved_minutes', 'fuel_cost_saved',
            'total_cod_expected', 'total_cod_collected',
            'start_latitude', 'start_longitude', 'start_address',
            'started_at', 'completed_at', 'created_at', 'stops'
        ]


class RouteAssignSerializer(serializers.Serializer):
    rider_id = serializers.IntegerField()
