"""
Route model - optimized delivery routes.
"""
from django.db import models


class RouteStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    OPTIMIZED = 'optimized', 'Optimized'
    ASSIGNED = 'assigned', 'Assigned'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class Route(models.Model):
    """Optimized delivery route."""
    
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='routes'
    )
    rider = models.ForeignKey(
        'riders.Rider',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='routes'
    )
    
    # Route Info
    name = models.CharField(max_length=255, blank=True, null=True)
    route_date = models.DateField(db_index=True)
    vehicle_type = models.CharField(max_length=50, default='motorbike')
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=RouteStatus.choices,
        default=RouteStatus.DRAFT
    )
    
    # Optimization Results
    total_stops = models.IntegerField(default=0)
    total_distance_km = models.FloatField(default=0.0)
    total_duration_minutes = models.FloatField(default=0.0)
    estimated_fuel_cost = models.FloatField(default=0.0)
    
    # Comparison with naive route (for ROI calculation)
    naive_distance_km = models.FloatField(null=True, blank=True)
    naive_duration_minutes = models.FloatField(null=True, blank=True)
    distance_saved_km = models.FloatField(null=True, blank=True)
    distance_saved_percent = models.FloatField(null=True, blank=True)
    time_saved_minutes = models.FloatField(null=True, blank=True)
    fuel_cost_saved = models.FloatField(null=True, blank=True)
    
    # Route Geometry (for map display)
    route_geometry = models.JSONField(null=True, blank=True)  # GeoJSON or polyline
    optimized_stop_order = models.JSONField(null=True, blank=True)  # List of order IDs
    
    # Start/End Points
    start_latitude = models.FloatField(null=True, blank=True)
    start_longitude = models.FloatField(null=True, blank=True)
    start_address = models.CharField(max_length=500, blank=True, null=True)
    end_latitude = models.FloatField(null=True, blank=True)
    end_longitude = models.FloatField(null=True, blank=True)
    end_address = models.CharField(max_length=500, blank=True, null=True)
    
    # Execution
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # COD Summary
    total_cod_expected = models.FloatField(default=0.0)
    total_cod_collected = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'routes'
        ordering = ['-route_date', '-created_at']
    
    def __str__(self):
        return f"Route #{self.id} - {self.route_date}"


class RouteStop(models.Model):
    """Individual stops in a route with sequence and timing."""
    
    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='stops'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='route_stops'
    )
    
    # Sequence
    sequence = models.IntegerField()
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    
    # Timing
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    
    # Distance/Duration from previous stop
    distance_from_previous_km = models.FloatField(null=True, blank=True)
    duration_from_previous_minutes = models.FloatField(null=True, blank=True)
    
    # Stop Status
    status = models.CharField(max_length=20, default='pending')
    
    class Meta:
        db_table = 'route_stops'
        ordering = ['sequence']
        unique_together = ['route', 'order']
    
    def __str__(self):
        return f"Stop #{self.sequence} on Route #{self.route_id}"
