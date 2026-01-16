"""
Notification Service - SMS/WhatsApp for ETA alerts.
Uses free tier services or can be mocked for demo.
"""
from typing import Optional
import httpx
from datetime import datetime
from app.config import settings


class NotificationService:
    """
    Notification service supporting multiple channels.
    For MVP, we implement a mock + optional Twilio free tier.
    """
    
    def __init__(self):
        self.sms_enabled = settings.SMS_ENABLED
        self.twilio_sid = settings.TWILIO_ACCOUNT_SID
        self. twilio_token = settings. TWILIO_AUTH_TOKEN
        self.twilio_phone = settings.TWILIO_PHONE_NUMBER
    
    def _format_phone_ghana(self, phone: str) -> str:
        """Format phone number for Ghana (+233)."""
        phone = "". join(filter(str.isdigit, phone))
        
        if phone.startswith("233"):
            return f"+{phone}"
        elif phone.startswith("0"):
            return f"+233{phone[1:]}"
        elif len(phone) == 9:
            return f"+233{phone}"
        
        return f"+{phone}"
    
    async def send_sms(
        self,
        phone: str,
        message: str
    ) -> dict:
        """Send SMS notification."""
        formatted_phone = self._format_phone_ghana(phone)
        
        if not self.sms_enabled:
            # Mock mode for demo
            print(f"[MOCK SMS] To: {formatted_phone}")
            print(f"[MOCK SMS] Message: {message}")
            return {
                "success": True,
                "mock":  True,
                "phone": formatted_phone,
                "message": message
            }
        
        # Twilio implementation
        if self.twilio_sid and self.twilio_token:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_sid}/Messages.json",
                        auth=(self.twilio_sid, self.twilio_token),
                        data={
                            "From": self.twilio_phone,
                            "To": formatted_phone,
                            "Body": message
                        }
                    )
                    
                    if response. status_code in [200, 201]:
                        return {"success": True, "sid": response.json().get("sid")}
                    else:
                        return {"success": False, "error": response. text}
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error":  "SMS not configured"}
    
    async def send_eta_notification(
        self,
        customer_phone: str,
        customer_name: str,
        eta_minutes: int,
        rider_name: Optional[str] = None,
        order_id: Optional[str] = None
    ) -> dict:
        """Send ETA notification to customer."""
        if eta_minutes < 5:
            eta_text = "within 5 minutes"
        elif eta_minutes < 60:
            eta_text = f"in about {eta_minutes} minutes"
        else:
            hours = eta_minutes // 60
            mins = eta_minutes % 60
            eta_text = f"in about {hours}h {mins}m"
        
        message = f"Hi {customer_name}! Your delivery"
        if order_id:
            message += f" (#{order_id})"
        message += f" is on the way and will arrive {eta_text}."
        
        if rider_name:
            message += f" Your rider is {rider_name}."
        
        message += " Thank you for your order!"
        
        return await self.send_sms(customer_phone, message)
    
    async def send_delivery_confirmation(
        self,
        customer_phone: str,
        customer_name: str,
        order_id: Optional[str] = None
    ) -> dict:
        """Send delivery confirmation to customer."""
        message = f"Hi {customer_name}! Your delivery"
        if order_id: 
            message += f" (#{order_id})"
        message += " has been completed.  Thank you!"
        
        return await self. send_sms(customer_phone, message)
    
    async def send_otp(
        self,
        customer_phone: str,
        otp_code: str
    ) -> dict:
        """Send OTP for delivery confirmation."""
        message = f"Your delivery confirmation code is:  {otp_code}.  Please share this with your rider."
        return await self.send_sms(customer_phone, message)
    
    async def send_failed_delivery_notice(
        self,
        customer_phone: str,
        customer_name: str,
        reason: str,
        order_id: Optional[str] = None
    ) -> dict:
        """Notify customer of failed delivery attempt."""
        message = f"Hi {customer_name}, we attempted to deliver your order"
        if order_id: 
            message += f" (#{order_id})"
        message += f" but were unable to complete it. Reason: {reason}.  We'll try again soon."
        
        return await self.send_sms(customer_phone, message)


notification_service = NotificationService()