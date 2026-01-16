from django.contrib import admin
from .models import Merchant


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ['id', 'business_name', 'email', 'business_type', 'is_active', 'created_at']
    list_filter = ['business_type', 'is_active', 'is_verified', 'subscription_status']
    search_fields = ['business_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
