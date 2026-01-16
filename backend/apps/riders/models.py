"""
Rider model - delivery personnel.
"""
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class RiderStatus(models.TextChoices):
    AVAILABLE = 'available', 'Available'
    ON_ROUTE = 'on_route', 'On Route'
    OFFLINE = 'offline', 'Offline'


class Rider(models.Model):
    """Delivery rider/personnel."""
    
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='riders'
    )
    
    # Profile
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    
    # Authentication (simple PIN for riders)
    pin_hash = models.CharField(max_length=255, blank=True, null=True)
    
    # Vehicle
    vehicle_type = models.CharField(max_length=50, default='motorbike')
    vehicle_registration = models.CharField(max_length=50, blank=True, null=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=RiderStatus.choices,
        default=RiderStatus.OFFLINE
    )
    is_active = models.BooleanField(default=True)
    
    # Current Location (for tracking)
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    total_deliveries = models.IntegerField(default=0)
    successful_deliveries = models.IntegerField(default=0)
    failed_deliveries = models.IntegerField(default=0)
    average_rating = models.FloatField(default=5.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'riders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.phone_number})"
    
    def set_pin(self, raw_pin):
        """Hash and set the PIN."""
        self.pin_hash = make_password(raw_pin)
    
    def check_pin(self, raw_pin):
        """Check if the provided PIN matches."""
        return check_password(raw_pin, self.pin_hash) if self.pin_hash else False
