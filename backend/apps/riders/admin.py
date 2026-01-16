from django.contrib import admin
from .models import Rider


@admin.register(Rider)
class RiderAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'phone_number', 'vehicle_type', 'status', 'is_active', 'total_deliveries']
    list_filter = ['status', 'is_active', 'vehicle_type']
    search_fields = ['name', 'phone_number', 'email']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['merchant']
