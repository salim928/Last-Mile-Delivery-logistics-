"""
Rider serializers for request/response validation.
"""
from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Rider, RiderStatus


phone_validator = RegexValidator(
    regex=r'^\+?[\d\s-]{10,20}$',
    message='Phone number must be 10-20 digits'
)


class RiderCreateSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=255)
    phone_number = serializers.CharField(validators=[phone_validator])
    email = serializers.EmailField(required=False, allow_null=True)
    vehicle_type = serializers.CharField(default='motorbike')
    vehicle_registration = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    def validate_phone_number(self, value):
        if Rider.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        return value


class RiderUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=255, required=False)
    phone_number = serializers.CharField(validators=[phone_validator], required=False)
    vehicle_type = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=RiderStatus.choices, required=False)
    is_active = serializers.BooleanField(required=False)


class RiderResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rider
        fields = [
            'id', 'merchant_id', 'name', 'phone_number', 'email',
            'vehicle_type', 'vehicle_registration', 'status',
            'is_active', 'total_deliveries', 'successful_deliveries',
            'failed_deliveries', 'average_rating', 'current_latitude',
            'current_longitude', 'location_updated_at', 'created_at'
        ]


class RiderLocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
