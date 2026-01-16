"""
Merchant serializers for request/response validation.
"""
from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Merchant, BusinessType


phone_validator = RegexValidator(
    regex=r'^\+?[\d\s-]{10,20}$',
    message='Phone number must be 10-20 digits'
)


class MerchantBaseSerializer(serializers.Serializer):
    business_name = serializers.CharField(min_length=2, max_length=255)
    business_type = serializers.ChoiceField(
        choices=BusinessType.choices,
        default=BusinessType.SME
    )
    phone_number = serializers.CharField(
        validators=[phone_validator],
        required=False,
        allow_blank=True,
        allow_null=True
    )
    city = serializers.CharField(default='Accra')
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class MerchantCreateSerializer(MerchantBaseSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    
    def validate_email(self, value):
        if Merchant.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()


class MerchantUpdateSerializer(serializers.Serializer):
    business_name = serializers.CharField(min_length=2, max_length=255, required=False)
    business_type = serializers.ChoiceField(choices=BusinessType.choices, required=False)
    phone_number = serializers.CharField(validators=[phone_validator], required=False)
    city = serializers.CharField(required=False)
    address = serializers.CharField(required=False)


class MerchantResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = [
            'id', 'email', 'business_name', 'business_type',
            'phone_number', 'city', 'address', 'is_active',
            'is_verified', 'subscription_status', 'trial_ends_at', 'created_at'
        ]


class MerchantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField(default='bearer')
    merchant = MerchantResponseSerializer()
