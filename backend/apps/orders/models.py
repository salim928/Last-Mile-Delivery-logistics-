"""
Order model - delivery orders from merchants.
"""
from django.db import models


class OrderStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ASSIGNED = 'assigned', 'Assigned'
    IN_TRANSIT = 'in_transit', 'In Transit'
    DELIVERED = 'delivered', 'Delivered'
    FAILED = 'failed', 'Failed'
    RETURNED = 'returned', 'Returned'


class VehicleType(models.TextChoices):
    MOTORBIKE = 'motorbike', 'Motorbike'
    VAN = 'van', 'Van'
    ANY = 'any', 'Any'


class Order(models.Model):
    """Delivery order from a merchant."""
    
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='orders'
    )
    
    # Order Reference
    external_order_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Customer Info
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True, null=True)
    
    # Delivery Address
    delivery_address = models.TextField()
    delivery_address_normalized = models.TextField(blank=True, null=True)
    delivery_city = models.CharField(max_length=100, default='Accra')
    delivery_landmark = models.CharField(max_length=255, blank=True, null=True)
    
    # Geocoded Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    geocoding_confidence = models.FloatField(null=True, blank=True)
    
    # Delivery Constraints
    delivery_window_start = models.DateTimeField(null=True, blank=True)
    delivery_window_end = models.DateTimeField(null=True, blank=True)
    preferred_vehicle = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.ANY
    )
    
    # Package Info
    package_description = models.TextField(blank=True, null=True)
    package_weight_kg = models.FloatField(default=1.0)
    package_size = models.CharField(max_length=50, default='medium')
    is_fragile = models.BooleanField(default=False)
    
    # COD (Cash on Delivery)
    is_cod = models.BooleanField(default=False)
    cod_amount = models.FloatField(default=0.0)
    cod_collected = models.FloatField(null=True, blank=True)
    cod_collected_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    status_notes = models.TextField(blank=True, null=True)
    
    # Assignment
    route = models.ForeignKey(
        'routes.Route',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    route_stop_sequence = models.IntegerField(null=True, blank=True)
    rider = models.ForeignKey(
        'riders.Rider',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Delivery Tracking
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    delivery_attempts = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"
