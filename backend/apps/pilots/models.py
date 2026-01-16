from django.db import models
from django.utils import timezone
import uuid


class PilotApplication(models.Model):
    """
    Stores pilot program applications from the demo page.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('contacted', 'Contacted'),
        ('onboarding', 'Onboarding'),
        ('active', 'Active Pilot'),
        ('rejected', 'Rejected'),
    ]
    
    FLEET_SIZE_CHOICES = [
        ('1-5', '1-5 riders'),
        ('6-15', '6-15 riders'),
        ('16-50', '16-50 riders'),
        ('51-100', '51-100 riders'),
        ('100+', '100+ riders'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Contact Information
    name = models.CharField(max_length=100)
    email = models.EmailField()
    company = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    
    # Business Information
    fleet_size = models.CharField(max_length=10, choices=FLEET_SIZE_CHOICES)
    challenges = models.TextField(blank=True, null=True)
    
    # Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    source = models.CharField(max_length=50, default='demo_page')
    
    # Metadata
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    contacted_at = models.DateTimeField(blank=True, null=True)
    
    # Notes for internal use
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pilot Application'
        verbose_name_plural = 'Pilot Applications'
    
    def __str__(self):
        return f"{self.company} - {self.name} ({self.status})"
    
    def mark_contacted(self):
        self.status = 'contacted'
        self.contacted_at = timezone.now()
        self.save()
