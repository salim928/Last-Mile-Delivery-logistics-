"""
Notification Views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from apps.authentication import MerchantJWTAuthentication
from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications.
    
    list: Get all notifications for the authenticated merchant
    retrieve: Get a specific notification
    mark_read: Mark notifications as read
    mark_all_read: Mark all notifications as read
    unread_count: Get count of unread notifications
    """
    
    serializer_class = NotificationSerializer
    authentication_classes = [MerchantJWTAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']
    
    def get_queryset(self):
        """Filter notifications by authenticated merchant."""
        merchant = self.request.user
        queryset = Notification.objects.filter(merchant=merchant)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """List notifications with pagination."""
        queryset = self.get_queryset()
        
        # Default limit to 50 recent notifications
        limit = int(request.query_params.get('limit', 50))
        queryset = queryset[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        
        # Include unread count
        unread_count = Notification.objects.filter(
            merchant=request.user,
            is_read=False
        ).count()
        
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count,
            'total': Notification.objects.filter(merchant=request.user).count()
        })
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read."""
        try:
            notification = self.get_queryset().get(pk=pk)
            notification.mark_as_read()
            return Response({'status': 'marked as read'})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        updated = Notification.objects.filter(
            merchant=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'status': 'success',
            'marked_count': updated
        })
    
    @action(detail=False, methods=['post'])
    def mark_selected_read(self, request):
        """Mark selected notifications as read."""
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data.get('notification_ids', [])
        
        if notification_ids:
            updated = Notification.objects.filter(
                merchant=request.user,
                id__in=notification_ids,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
        else:
            # Mark all as read
            updated = Notification.objects.filter(
                merchant=request.user,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
        
        return Response({
            'status': 'success',
            'marked_count': updated
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = Notification.objects.filter(
            merchant=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all read notifications (keeps unread)."""
        deleted, _ = Notification.objects.filter(
            merchant=request.user,
            is_read=True
        ).delete()
        
        return Response({
            'status': 'success',
            'deleted_count': deleted
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a specific notification."""
        try:
            notification = self.get_queryset().get(pk=kwargs.get('pk'))
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
