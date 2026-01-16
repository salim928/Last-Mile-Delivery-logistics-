"""
Proof of Delivery serializers.
"""
from rest_framework import serializers
from .models import ProofOfDelivery


class PODCreateSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    photo_base64 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    otp_code = serializers.CharField(min_length=4, max_length=6, required=False, allow_null=True)
    recipient_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    recipient_signature = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    delivery_latitude = serializers.FloatField(required=False, allow_null=True)
    delivery_longitude = serializers.FloatField(required=False, allow_null=True)
    cod_amount_collected = serializers.FloatField(default=0.0)
    cod_payment_method = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    notes = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    failure_reason = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class PODResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProofOfDelivery
        fields = [
            'id', 'order_id', 'rider_id', 'photo_url',
            'otp_verified', 'recipient_name', 'delivery_latitude',
            'delivery_longitude', 'cod_amount_collected', 'cod_payment_method',
            'notes', 'failure_reason', 'captured_at'
        ]


class OTPVerifySerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    otp_code = serializers.CharField(min_length=4, max_length=6)


class OTPGenerateResponseSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    otp_sent = serializers.BooleanField()
    message = serializers.CharField()
