from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import PilotApplication
from .serializers import PilotApplicationSerializer
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_pilot_application(request):
    """
    Submit a new pilot program application.
    Sends email notification to founder.
    """
    serializer = PilotApplicationSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save application with metadata
        application = serializer.save(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
        )
        
        # Send email notification to founder
        try:
            send_pilot_notification_email(application)
        except Exception as e:
            logger.error(f"Failed to send pilot notification email: {e}")
            # Don't fail the request if email fails
        
        return Response({
            'success': True,
            'message': 'Application received! We\'ll contact you within 24 hours.',
            'application_id': str(application.id),
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


def send_pilot_notification_email(application):
    """Send email notification about new pilot application."""
    
    subject = f"🚀 New Pilot Application: {application.company}"
    
    # Plain text version
    message = f"""
New Pilot Program Application Received!

CONTACT INFORMATION
-------------------
Name: {application.name}
Email: {application.email}
Phone: {application.phone}
Company: {application.company}

BUSINESS DETAILS
----------------
Fleet Size: {application.fleet_size}
Challenges: {application.challenges or 'Not provided'}

METADATA
--------
Submitted: {application.created_at.strftime('%Y-%m-%d %H:%M:%S')}
Source: {application.source}
IP: {application.ip_address}

---
Reply to this email or call {application.phone} to follow up.
WhatsApp: https://wa.me/{application.phone.replace('+', '')}

Movva Pilot Program
"""

    # HTML version
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #f59e0b); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0;">🚀 New Pilot Application</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">{application.company}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Name</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #1e293b;">{application.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Email</td>
                    <td style="padding: 8px 0;"><a href="mailto:{application.email}" style="color: #f97316;">{application.email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Phone</td>
                    <td style="padding: 8px 0;"><a href="tel:{application.phone}" style="color: #f97316;">{application.phone}</a></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b;">Company</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #1e293b;">{application.company}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Business Details</h2>
            <p><strong>Fleet Size:</strong> {application.fleet_size}</p>
            <p><strong>Challenges:</strong><br>{application.challenges or 'Not provided'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://wa.me/{application.phone.replace('+', '').replace(' ', '')}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
                📱 WhatsApp
            </a>
            <a href="mailto:{application.email}" 
               style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                ✉️ Email
            </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            Submitted on {application.created_at.strftime('%B %d, %Y at %I:%M %p')} • Movva Pilot Program
        </p>
    </body>
    </html>
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.PILOT_NOTIFICATION_EMAIL],
        html_message=html_message,
        fail_silently=False,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def pilot_stats(request):
    """
    Return pilot program stats (for landing page social proof).
    """
    total_applications = PilotApplication.objects.count()
    active_pilots = PilotApplication.objects.filter(status='active').count()
    
    # Calculate remaining spots (out of 10)
    remaining_spots = max(0, 10 - PilotApplication.objects.filter(
        status__in=['pending', 'contacted', 'onboarding', 'active']
    ).count())
    
    return Response({
        'total_applications': total_applications,
        'active_pilots': active_pilots,
        'remaining_spots': remaining_spots,
        'spots_limited': remaining_spots <= 5,  # Show urgency when 5 or fewer spots
    })
