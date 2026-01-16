"""
Merchant model - businesses using the platform.
"""
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class BusinessType(models.TextChoices):
    ECOMMERCE = 'ecommerce', 'E-Commerce'
    PHARMACY = 'pharmacy', 'Pharmacy'
    SUPERMARKET = 'supermarket', 'Supermarket'
    SME = 'sme', 'SME'
    COURIER = 'courier', 'Courier'
    OTHER = 'other', 'Other'


class Merchant(models.Model):
    """Business account using the logistics platform."""
    
    # Authentication
    email = models.EmailField(unique=True, db_index=True)
    hashed_password = models.CharField(max_length=255)
    
    # Profile
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(
        max_length=20,
        choices=BusinessType.choices,
        default=BusinessType.SME
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, default='Accra')
    address = models.CharField(max_length=500, blank=True, null=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Trial/Subscription
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    subscription_status = models.CharField(max_length=50, default='trial')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'merchants'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.business_name
    
    def set_password(self, raw_password):
        """Hash and set the password."""
        self.hashed_password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password matches."""
        return check_password(raw_password, self.hashed_password)
    
    @property
    def is_authenticated(self):
        """Required for DRF authentication."""
        return True
