from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'merchant', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'merchant__business_name']
    readonly_fields = ['created_at', 'read_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('merchant', 'notification_type', 'priority')
        }),
        ('Content', {
            'fields': ('title', 'message')
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'created_at')
        }),
    )
