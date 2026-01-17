"""
Notification Serializers.
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    time_ago = serializers.SerializerMethodField()
    icon_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'priority',
            'title',
            'message',
            'related_object_type',
            'related_object_id',
            'is_read',
            'read_at',
            'metadata',
            'created_at',
            'time_ago',
            'icon_type',
        ]
        read_only_fields = ['id', 'created_at', 'time_ago', 'icon_type']
    
    def get_time_ago(self, obj):
        """Return human-readable time ago string."""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'Just now'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'{minutes} minute{"s" if minutes != 1 else ""} ago'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} hour{"s" if hours != 1 else ""} ago'
        elif diff < timedelta(days=7):
            days = diff.days
            return f'{days} day{"s" if days != 1 else ""} ago'
        else:
            return obj.created_at.strftime('%b %d, %Y')
    
    def get_icon_type(self, obj):
        """Return icon type for frontend mapping."""
        icon_map = {
            'order': 'package',
            'route': 'route',
            'rider': 'users',
            'pod': 'check-circle',
            'system': 'info',
            'payment': 'wallet',
            'alert': 'alert-triangle',
        }
        return icon_map.get(obj.notification_type, 'bell')


class NotificationMarkReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read."""
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of notification IDs to mark as read. If empty, marks all as read."
    )
