from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'external_order_id', 'customer_name', 'status', 'is_cod', 'cod_amount', 'created_at']
    list_filter = ['status', 'is_cod', 'delivery_city', 'preferred_vehicle']
    search_fields = ['customer_name', 'customer_phone', 'external_order_id', 'delivery_address']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['merchant', 'route', 'rider']
