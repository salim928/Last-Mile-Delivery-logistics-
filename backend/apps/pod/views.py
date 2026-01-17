"""
Proof of Delivery API views.
"""
import os
import uuid
import random
import string
import base64
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import ProofOfDelivery
from .serializers import (
    PODCreateSerializer,
    PODResponseSerializer,
    OTPVerifySerializer,
    OTPGenerateResponseSerializer
)
from apps.orders.models import Order, OrderStatus
from apps.services.notifications import notification_service


def generate_otp(length=4):
    """Generate random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


@api_view(['POST'])
def generate_delivery_otp(request, order_id):
    """Generate and send OTP to customer for delivery confirmation."""
    try:
        order = Order.objects.get(id=order_id, merchant=request.merchant)
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    otp_code = generate_otp()
    
    # Store OTP in POD record (create if doesn't exist)
    pod, created = ProofOfDelivery.objects.get_or_create(
        order=order,
        defaults={'rider_id': order.rider_id}
    )
    
    pod.otp_code = otp_code
    pod.save()
    
    # Send OTP to customer
    result = notification_service.send_otp(
        order.customer_phone,
        otp_code
    )
    
    return Response({
        'order_id': order_id,
        'otp_sent': result.get('success', False),
        'message': 'OTP sent to customer' if result.get('success') else 'Failed to send OTP (check logs)'
    })


@api_view(['POST'])
def verify_delivery_otp(request):
    """Verify OTP for delivery confirmation."""
    serializer = OTPVerifySerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    order_id = serializer.validated_data['order_id']
    otp_code = serializer.validated_data['otp_code']
    
    try:
        pod = ProofOfDelivery.objects.get(order_id=order_id)
    except ProofOfDelivery.DoesNotExist:
        return Response(
            {'detail': 'No OTP generated for this order'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not pod.otp_code:
        return Response(
            {'detail': 'No OTP generated for this order'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if pod.otp_code != otp_code:
        return Response(
            {'detail': 'Invalid OTP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    pod.otp_verified = timezone.now()
    pod.save()
    
    return Response({'verified': True, 'order_id': order_id})


@api_view(['POST'])
def upload_pod_photo(request):
    """Upload photo proof of delivery (multipart form)."""
    order_id = request.data.get('order_id') or request.POST.get('order_id')
    photo = request.FILES.get('photo')
    
    if not order_id or not photo:
        return Response(
            {'detail': 'order_id and photo are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        order_id = int(order_id)
    except ValueError:
        return Response(
            {'detail': 'Invalid order_id'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if rider is authorized for this order
    rider_id = getattr(request, 'rider_id', None)
    merchant = request.merchant
    
    try:
        if rider_id:
            order = Order.objects.get(id=order_id, rider_id=rider_id)
        elif merchant:
            order = Order.objects.get(id=order_id, merchant=merchant)
        else:
            return Response(
                {'detail': 'Not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create upload directory
    os.makedirs(settings.POD_IMAGES_DIR, exist_ok=True)
    
    # Generate unique filename
    ext = photo.name.split('.')[-1] if '.' in photo.name else 'jpg'
    filename = f"{uuid.uuid4()}.{ext}"
    photo_path = os.path.join(settings.POD_IMAGES_DIR, filename)
    
    try:
        with open(photo_path, 'wb') as f:
            for chunk in photo.chunks():
                f.write(chunk)
        
        # Get or create POD record
        pod, created = ProofOfDelivery.objects.get_or_create(
            order=order,
            defaults={'rider_id': order.rider_id or rider_id}
        )
        
        pod.photo_path = photo_path
        pod.photo_url = f"/uploads/pod/{filename}"
        pod.save()
        
        return Response({
            'success': True,
            'order_id': order_id,
            'photo_url': pod.photo_url
        })
    except Exception as e:
        return Response(
            {'detail': f'Failed to save photo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_proof_of_delivery(request):
    """Create proof of delivery record."""
    serializer = PODCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    order_id = data['order_id']
    
    try:
        order = Order.objects.get(id=order_id, merchant=request.merchant)
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if POD already exists and is verified
    try:
        existing_pod = ProofOfDelivery.objects.get(order=order)
        if existing_pod.otp_verified:
            return Response(
                {'detail': 'Proof of delivery already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        pod = existing_pod
    except ProofOfDelivery.DoesNotExist:
        pod = ProofOfDelivery(order=order, rider_id=order.rider_id)
    
    # Handle photo upload (base64)
    if data.get('photo_base64'):
        os.makedirs(settings.POD_IMAGES_DIR, exist_ok=True)
        
        filename = f"{uuid.uuid4()}.jpg"
        photo_path = os.path.join(settings.POD_IMAGES_DIR, filename)
        
        try:
            image_data = base64.b64decode(data['photo_base64'])
            with open(photo_path, 'wb') as f:
                f.write(image_data)
            
            pod.photo_path = photo_path
            pod.photo_url = f"/uploads/pod/{filename}"
        except Exception as e:
            return Response(
                {'detail': f'Failed to save photo: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Update POD fields
    pod.recipient_name = data.get('recipient_name')
    pod.recipient_signature = data.get('recipient_signature')
    pod.delivery_latitude = data.get('delivery_latitude')
    pod.delivery_longitude = data.get('delivery_longitude')
    pod.cod_amount_collected = data.get('cod_amount_collected', 0.0)
    pod.cod_payment_method = data.get('cod_payment_method')
    pod.notes = data.get('notes')
    pod.failure_reason = data.get('failure_reason')
    pod.save()
    
    # Update order status
    if data.get('failure_reason'):
        order.status = OrderStatus.FAILED
        order.delivery_attempts += 1
        
        # Notify about failed delivery
        try:
            from apps.notifications.models import Notification
            Notification.notify_order_failed(order, data.get('failure_reason', ''))
        except Exception:
            pass
    else:
        order.status = OrderStatus.DELIVERED
        order.actual_delivery_time = timezone.now()
        order.cod_collected = data.get('cod_amount_collected', 0.0)
        order.cod_collected_at = timezone.now() if order.is_cod else None
        
        # Notify about successful delivery
        try:
            from apps.notifications.models import Notification
            Notification.notify_order_delivered(order)
            
            # Notify about COD collection if applicable
            if order.is_cod and data.get('cod_amount_collected', 0) > 0:
                Notification.notify_cod_collected(order, data.get('cod_amount_collected', 0))
        except Exception:
            pass
    
    order.save()
    
    return Response(
        PODResponseSerializer(pod).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def get_proof_of_delivery(request, order_id):
    """Get proof of delivery for an order."""
    try:
        order = Order.objects.get(id=order_id, merchant=request.merchant)
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        pod = ProofOfDelivery.objects.get(order=order)
    except ProofOfDelivery.DoesNotExist:
        return Response(
            {'detail': 'No proof of delivery for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(PODResponseSerializer(pod).data)
