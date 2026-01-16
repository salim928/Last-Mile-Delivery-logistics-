from rest_framework import serializers
from .models import PilotApplication


class PilotApplicationSerializer(serializers.ModelSerializer):
    """Serializer for creating pilot applications."""
    
    class Meta:
        model = PilotApplication
        fields = [
            'id',
            'name',
            'email',
            'company',
            'phone',
            'fleet_size',
            'challenges',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_email(self, value):
        """Check if email already applied."""
        if PilotApplication.objects.filter(
            email=value,
            status__in=['pending', 'contacted', 'onboarding', 'active']
        ).exists():
            raise serializers.ValidationError(
                "This email has already submitted a pilot application. We'll be in touch soon!"
            )
        return value.lower()
    
    def validate_phone(self, value):
        """Normalize Ghana phone numbers."""
        # Remove spaces and dashes
        phone = value.replace(' ', '').replace('-', '')
        
        # If starts with 0, convert to Ghana format
        if phone.startswith('0'):
            phone = '+233' + phone[1:]
        
        # If no country code, assume Ghana
        if not phone.startswith('+'):
            phone = '+233' + phone
        
        return phone


class PilotApplicationAdminSerializer(serializers.ModelSerializer):
    """Full serializer for admin views."""
    
    class Meta:
        model = PilotApplication
        fields = '__all__'
