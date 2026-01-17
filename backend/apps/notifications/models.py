"""
Notification Models - Real-time notifications for merchants.
"""
from django.db import models
from django.utils import timezone


class Notification(models.Model):
    """
    Notification model for storing alerts, updates, and system messages.
    """
    
    class NotificationType(models.TextChoices):
        ORDER = 'order', 'Order Update'
        ROUTE = 'route', 'Route Update'
        RIDER = 'rider', 'Rider Update'
        POD = 'pod', 'Proof of Delivery'
        SYSTEM = 'system', 'System Alert'
        PAYMENT = 'payment', 'Payment Update'
        ALERT = 'alert', 'Alert'
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Optional link to related object
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    related_object_id = models.IntegerField(blank=True, null=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['merchant', '-created_at']),
            models.Index(fields=['merchant', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.merchant.business_name}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    @classmethod
    def create_notification(
        cls,
        merchant,
        notification_type,
        title,
        message,
        priority='medium',
        related_object_type=None,
        related_object_id=None,
        metadata=None
    ):
        """
        Factory method to create a notification.
        """
        return cls.objects.create(
            merchant=merchant,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            metadata=metadata or {}
        )
    
    @classmethod
    def notify_order_created(cls, order):
        """Create notification when new order is created."""
        return cls.create_notification(
            merchant=order.merchant,
            notification_type=cls.NotificationType.ORDER,
            title='New Order Created',
            message=f'Order #{order.id} for {order.customer_name} has been created.',
            priority=cls.Priority.MEDIUM,
            related_object_type='order',
            related_object_id=order.id,
            metadata={'order_id': order.id, 'customer': order.customer_name}
        )
    
    @classmethod
    def notify_order_delivered(cls, order):
        """Create notification when order is delivered."""
        return cls.create_notification(
            merchant=order.merchant,
            notification_type=cls.NotificationType.POD,
            title='Order Delivered ✓',
            message=f'Order #{order.id} for {order.customer_name} has been delivered successfully.',
            priority=cls.Priority.LOW,
            related_object_type='order',
            related_object_id=order.id,
            metadata={'order_id': order.id, 'customer': order.customer_name}
        )
    
    @classmethod
    def notify_order_failed(cls, order, reason=''):
        """Create notification when delivery fails."""
        return cls.create_notification(
            merchant=order.merchant,
            notification_type=cls.NotificationType.ALERT,
            title='Delivery Failed',
            message=f'Order #{order.id} delivery failed. {reason}',
            priority=cls.Priority.HIGH,
            related_object_type='order',
            related_object_id=order.id,
            metadata={'order_id': order.id, 'reason': reason}
        )
    
    @classmethod
    def notify_route_optimized(cls, route):
        """Create notification when route is optimized."""
        return cls.create_notification(
            merchant=route.merchant,
            notification_type=cls.NotificationType.ROUTE,
            title='Route Optimized',
            message=f'Route "{route.name}" has been optimized with {route.total_orders} orders.',
            priority=cls.Priority.MEDIUM,
            related_object_type='route',
            related_object_id=route.id,
            metadata={
                'route_id': route.id,
                'route_name': route.name,
                'total_orders': route.total_orders
            }
        )
    
    @classmethod
    def notify_rider_online(cls, merchant, rider):
        """Create notification when rider comes online."""
        return cls.create_notification(
            merchant=merchant,
            notification_type=cls.NotificationType.RIDER,
            title='Rider Online',
            message=f'{rider.name} is now available for deliveries.',
            priority=cls.Priority.LOW,
            related_object_type='rider',
            related_object_id=rider.id,
            metadata={'rider_id': rider.id, 'rider_name': rider.name}
        )
    
    @classmethod
    def notify_rider_offline(cls, merchant, rider):
        """Create notification when rider goes offline."""
        return cls.create_notification(
            merchant=merchant,
            notification_type=cls.NotificationType.RIDER,
            title='Rider Offline',
            message=f'{rider.name} has gone offline.',
            priority=cls.Priority.LOW,
            related_object_type='rider',
            related_object_id=rider.id,
            metadata={'rider_id': rider.id, 'rider_name': rider.name}
        )
    
    @classmethod
    def notify_cod_collected(cls, order, amount):
        """Create notification for COD collection."""
        return cls.create_notification(
            merchant=order.merchant,
            notification_type=cls.NotificationType.PAYMENT,
            title='COD Collected',
            message=f'₵{amount:.2f} collected for Order #{order.id}',
            priority=cls.Priority.MEDIUM,
            related_object_type='order',
            related_object_id=order.id,
            metadata={'order_id': order.id, 'amount': float(amount)}
        )
    
    @classmethod
    def notify_system_alert(cls, merchant, title, message, priority='medium'):
        """Create a system alert notification."""
        return cls.create_notification(
            merchant=merchant,
            notification_type=cls.NotificationType.SYSTEM,
            title=title,
            message=message,
            priority=priority
        )
