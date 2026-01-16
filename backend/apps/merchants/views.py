"""
Authentication views for merchants.
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
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

logger = logging.getLogger(__name__)


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
    
    # Send welcome email (async, don't block registration)
    try:
        send_welcome_email(merchant)
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        # Don't fail the request if email fails
    
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


def send_welcome_email(merchant):
    """Send welcome email to newly registered merchant."""
    subject = f"Welcome to Movva, {merchant.business_name}! 🎉"
    
    # Plain text version
    message = f"""
Hi {merchant.business_name}!

Welcome to Movva - Africa's smartest last-mile delivery platform! 🚚

Your 14-day free trial has started, giving you full access to:
✅ AI-powered route optimization
✅ Real-time GPS tracking
✅ Unlimited riders & orders
✅ Advanced analytics & reports
✅ COD reconciliation
✅ Priority support

Account Details:
Email: {merchant.email}
Business: {merchant.business_name}
Trial Ends: {merchant.trial_ends_at.strftime('%B %d, %Y')}

🚀 Getting Started:
1. Log in to your dashboard
2. Add your riders
3. Import or create your first orders
4. Let our AI optimize your routes

Need help? We're here for you:
📧 Email: support@movva.app
💬 WhatsApp: {settings.PILOT_WHATSAPP_NUMBER}
📚 Documentation: https://docs.movva.app

Happy delivering!
The Movva Team

---
You're receiving this email because you signed up for Movva.
© 2026 Movva. All rights reserved.
"""
    
    # HTML version
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                🚚 Movva
            </h1>
            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Smart Last-Mile Delivery
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
                Welcome aboard, {merchant.business_name}! 🎉
            </h2>
            
            <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your <strong>14-day free trial</strong> is now active with full access to all premium features:
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f;">
                    <li style="margin: 8px 0;">✅ AI-powered route optimization</li>
                    <li style="margin: 8px 0;">✅ Real-time GPS tracking</li>
                    <li style="margin: 8px 0;">✅ Unlimited riders & orders</li>
                    <li style="margin: 8px 0;">✅ Advanced analytics & reports</li>
                    <li style="margin: 8px 0;">✅ COD reconciliation</li>
                    <li style="margin: 8px 0;">✅ Priority support</li>
                </ul>
            </div>
            
            <!-- Account Details -->
            <div style="background-color: #f1f5f9; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 18px; font-weight: 600;">
                    Account Details
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">{merchant.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Business</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">{merchant.business_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Trial Ends</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">{merchant.trial_ends_at.strftime('%B %d, %Y')}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Getting Started -->
            <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 18px; font-weight: 600;">
                    🚀 Getting Started
                </h3>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #475569; line-height: 1.8;">
                    <li style="margin: 8px 0;">Log in to your dashboard</li>
                    <li style="margin: 8px 0;">Add your riders</li>
                    <li style="margin: 8px 0;">Import or create your first orders</li>
                    <li style="margin: 8px 0;">Let our AI optimize your routes</li>
                </ol>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://last-mile-delivery-logistics-q9pm.vercel.app/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);">
                    Go to Dashboard →
                </a>
            </div>
            
            <!-- Support -->
            <div style="background-color: #f8fafc; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 15px; color: #475569; font-size: 14px;">
                    <strong>Need help?</strong> We're here for you:
                </p>
                <div style="display: inline-block; text-align: left;">
                    <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                        📧 <a href="mailto:support@movva.app" style="color: #f97316; text-decoration: none;">support@movva.app</a>
                    </p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                        💬 <a href="https://wa.me/{settings.PILOT_WHATSAPP_NUMBER.replace('+', '')}" style="color: #f97316; text-decoration: none;">WhatsApp Support</a>
                    </p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                        📚 <a href="https://docs.movva.app" style="color: #f97316; text-decoration: none;">Documentation</a>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                Happy delivering! 🚚
            </p>
            <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 600;">
                The Movva Team
            </p>
            <p style="margin: 20px 0 0; color: #94a3b8; font-size: 12px;">
                You're receiving this email because you signed up for Movva.<br>
                © 2026 Movva. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
"""
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[merchant.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Welcome email sent to {merchant.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {merchant.email}: {e}")
        # Don't fail registration if email fails
        pass
