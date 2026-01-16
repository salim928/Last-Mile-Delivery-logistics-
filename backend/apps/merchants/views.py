"""
Authentication views for merchants.
"""
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Merchant
from .serializers import (
    MerchantCreateSerializer,
    MerchantLoginSerializer,
    MerchantResponseSerializer,
    TokenSerializer
)


def get_tokens_for_merchant(merchant):
    """Generate JWT tokens for a merchant."""
    refresh = RefreshToken()
    refresh['merchant_id'] = merchant.id
    refresh['email'] = merchant.email
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new merchant account."""
    serializer = MerchantCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Create merchant
    data = serializer.validated_data
    merchant = Merchant(
        email=data['email'],
        business_name=data['business_name'],
        business_type=data.get('business_type', 'sme'),
        phone_number=data.get('phone_number'),
        city=data.get('city', 'Accra'),
        address=data.get('address'),
        trial_ends_at=timezone.now() + timedelta(days=14),  # 2-week trial
        subscription_status='trial'
    )
    merchant.set_password(data['password'])
    merchant.save()
    
    # Generate token
    tokens = get_tokens_for_merchant(merchant)
    
    response_data = {
        'access_token': tokens['access'],
        'token_type': 'bearer',
        'merchant': MerchantResponseSerializer(merchant).data
    }
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login with email and password."""
    serializer = MerchantLoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email'].lower()
    password = serializer.validated_data['password']
    
    try:
        merchant = Merchant.objects.get(email=email)
    except Merchant.DoesNotExist:
        return Response(
            {'detail': 'Incorrect email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not merchant.check_password(password):
        return Response(
            {'detail': 'Incorrect email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not merchant.is_active:
        return Response(
            {'detail': 'Account is deactivated'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate token
    tokens = get_tokens_for_merchant(merchant)
    
    response_data = {
        'access_token': tokens['access'],
        'token_type': 'bearer',
        'merchant': MerchantResponseSerializer(merchant).data
    }
    
    return Response(response_data)


@api_view(['GET', 'PATCH'])
def get_current_merchant(request):
    """Get or update current authenticated merchant info."""
    if request.method == 'GET':
        return Response(MerchantResponseSerializer(request.merchant).data)
    
    # PATCH - Update profile
    merchant = request.merchant
    data = request.data
    
    if 'business_name' in data:
        merchant.business_name = data['business_name']
    if 'phone_number' in data:
        merchant.phone_number = data['phone_number']
    if 'city' in data:
        merchant.city = data['city']
    if 'address' in data:
        merchant.address = data['address']
    
    merchant.save()
    return Response(MerchantResponseSerializer(merchant).data)


@api_view(['POST'])
def change_password(request):
    """Change merchant password."""
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'detail': 'Both current and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    merchant = request.merchant
    
    if not merchant.check_password(current_password):
        return Response(
            {'detail': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'detail': 'New password must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    merchant.set_password(new_password)
    merchant.save()
    
    return Response({'detail': 'Password changed successfully'})
