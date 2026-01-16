"""
Proof of Delivery model - delivery confirmation evidence.
"""
from django.db import models


class ProofOfDelivery(models.Model):
    """Proof of delivery record with photo, OTP, and signature."""
    
    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='proof_of_delivery'
    )
    rider = models.ForeignKey(
        'riders.Rider',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proof_of_deliveries'
    )
    
    # Photo Proof
    photo_url = models.CharField(max_length=500, blank=True, null=True)
    photo_path = models.CharField(max_length=500, blank=True, null=True)  # Local storage path
    
    # OTP Confirmation
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_verified = models.DateTimeField(null=True, blank=True)
    
    # Recipient Info
    recipient_name = models.CharField(max_length=255, blank=True, null=True)
    recipient_signature = models.TextField(blank=True, null=True)  # Base64 encoded signature
    
    # Location at delivery
    delivery_latitude = models.FloatField(null=True, blank=True)
    delivery_longitude = models.FloatField(null=True, blank=True)
    
    # COD Collection
    cod_amount_collected = models.FloatField(default=0.0)
    cod_payment_method = models.CharField(max_length=50, blank=True, null=True)  # cash, mobile_money
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    captured_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)  # When offline data was synced
    
    class Meta:
        db_table = 'proof_of_delivery'
        verbose_name = 'Proof of Delivery'
        verbose_name_plural = 'Proofs of Delivery'
    
    def __str__(self):
        return f"POD for Order #{self.order_id}"
