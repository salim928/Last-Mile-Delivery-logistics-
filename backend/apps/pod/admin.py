from django.contrib import admin
from .models import ProofOfDelivery


@admin.register(ProofOfDelivery)
class ProofOfDeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'rider', 'otp_verified', 'cod_amount_collected', 'captured_at']
    list_filter = ['cod_payment_method']
    search_fields = ['order__customer_name', 'recipient_name']
    readonly_fields = ['captured_at', 'synced_at']
    raw_id_fields = ['order', 'rider']
