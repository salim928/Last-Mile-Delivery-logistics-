"""
Order serializers for request/response validation.
"""
from rest_framework import serializers
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from .models import Order, OrderStatus, VehicleType


phone_validator = RegexValidator(
    regex=r'^\+?[\d\s-]{10,20}$',
    message='Phone number must be 10-20 digits'
)


class OrderCreateSerializer(serializers.Serializer):
    external_order_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    customer_name = serializers.CharField(min_length=2, max_length=255)
    customer_phone = serializers.CharField(validators=[phone_validator])
    customer_email = serializers.EmailField(required=False, allow_null=True)
    delivery_address = serializers.CharField(min_length=5)
    delivery_city = serializers.CharField(default='Accra')
    delivery_landmark = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    delivery_window_start = serializers.DateTimeField(required=False, allow_null=True)
    delivery_window_end = serializers.DateTimeField(required=False, allow_null=True)
    preferred_vehicle = serializers.ChoiceField(
        choices=VehicleType.choices,
        default=VehicleType.ANY
    )
    package_description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    package_weight_kg = serializers.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(100)]
    )
    package_size = serializers.CharField(default='medium', required=False)
    is_fragile = serializers.BooleanField(default=False)
    is_cod = serializers.BooleanField(default=False)
    cod_amount = serializers.FloatField(default=0.0, validators=[MinValueValidator(0)])


class OrderUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices, required=False)
    status_notes = serializers.CharField(required=False, allow_null=True)
    rider_id = serializers.IntegerField(required=False, allow_null=True)
    cod_collected = serializers.FloatField(required=False, allow_null=True)


class OrderResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id', 'merchant_id', 'external_order_id',
            'customer_name', 'customer_phone', 'customer_email',
            'delivery_address', 'delivery_address_normalized',
            'delivery_city', 'delivery_landmark',
            'latitude', 'longitude', 'geocoding_confidence',
            'delivery_window_start', 'delivery_window_end',
            'preferred_vehicle', 'package_description',
            'package_weight_kg', 'package_size', 'is_fragile',
            'is_cod', 'cod_amount', 'cod_collected',
            'status', 'route_id', 'route_stop_sequence',
            'rider_id', 'estimated_delivery_time',
            'actual_delivery_time', 'delivery_attempts',
            'created_at'
        ]


class OrderBulkCreateSerializer(serializers.Serializer):
    orders = OrderCreateSerializer(many=True)


class OrderBulkResponseSerializer(serializers.Serializer):
    total_received = serializers.IntegerField()
    total_created = serializers.IntegerField()
    total_failed = serializers.IntegerField()
    created_orders = OrderResponseSerializer(many=True)
    errors = serializers.ListField(child=serializers.DictField())
