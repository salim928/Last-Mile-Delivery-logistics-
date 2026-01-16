"""
Notification Service - SMS/WhatsApp for ETA alerts.
Supports Hubtel (Ghana), Arkesel, and Twilio.
"""
import httpx
import base64
from django.conf import settings


class NotificationService:
    """
    Notification service supporting multiple SMS providers.
    Priority: Hubtel (Ghana) > Arkesel > Twilio > Mock
    """
    
    def __init__(self):
        self.sms_enabled = getattr(settings, 'SMS_ENABLED', False)
        
        # Hubtel Ghana (recommended for Ghana)
        self.hubtel_client_id = getattr(settings, 'HUBTEL_CLIENT_ID', '')
        self.hubtel_client_secret = getattr(settings, 'HUBTEL_CLIENT_SECRET', '')
        self.hubtel_sender_id = getattr(settings, 'HUBTEL_SENDER_ID', 'Movva')
        
        # Arkesel (alternative Ghana provider)
        self.arkesel_api_key = getattr(settings, 'ARKESEL_API_KEY', '')
        self.arkesel_sender_id = getattr(settings, 'ARKESEL_SENDER_ID', 'Movva')
        
        # Twilio (international fallback)
        self.twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        self.twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        self.twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', '')
    
    def _format_phone_ghana(self, phone: str) -> str:
        """Format phone number for Ghana (+233)."""
        phone = "".join(filter(str.isdigit, phone))
        
        if phone.startswith("233"):
            return f"+{phone}"
        elif phone.startswith("0"):
            return f"+233{phone[1:]}"
        elif len(phone) == 9:
            return f"+233{phone}"
        
        return f"+{phone}"
    
    def _send_hubtel_sms(self, phone: str, message: str) -> dict:
        """Send SMS via Hubtel Ghana."""
        try:
            # Hubtel uses Basic Auth
            credentials = base64.b64encode(
                f"{self.hubtel_client_id}:{self.hubtel_client_secret}".encode()
            ).decode()
            
            with httpx.Client() as client:
                response = client.post(
                    "https://smsc.hubtel.com/v1/messages/send",
                    headers={
                        "Authorization": f"Basic {credentials}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "From": self.hubtel_sender_id,
                        "To": phone,
                        "Content": message
                    },
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    return {"success": True, "provider": "hubtel", "response": response.json()}
                else:
                    return {"success": False, "provider": "hubtel", "error": response.text}
        except Exception as e:
            return {"success": False, "provider": "hubtel", "error": str(e)}
    
    def _send_arkesel_sms(self, phone: str, message: str) -> dict:
        """Send SMS via Arkesel Ghana."""
        try:
            with httpx.Client() as client:
                response = client.post(
                    "https://sms.arkesel.com/api/v2/sms/send",
                    headers={
                        "api-key": self.arkesel_api_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "sender": self.arkesel_sender_id,
                        "recipients": [phone],
                        "message": message
                    },
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    return {"success": True, "provider": "arkesel", "response": response.json()}
                else:
                    return {"success": False, "provider": "arkesel", "error": response.text}
        except Exception as e:
            return {"success": False, "provider": "arkesel", "error": str(e)}
    
    def _send_twilio_sms(self, phone: str, message: str) -> dict:
        """Send SMS via Twilio (international)."""
        try:
            with httpx.Client() as client:
                response = client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_sid}/Messages.json",
                    auth=(self.twilio_sid, self.twilio_token),
                    data={
                        "From": self.twilio_phone,
                        "To": phone,
                        "Body": message
                    },
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    return {"success": True, "provider": "twilio", "sid": response.json().get("sid")}
                else:
                    return {"success": False, "provider": "twilio", "error": response.text}
        except Exception as e:
            return {"success": False, "provider": "twilio", "error": str(e)}
    
    def send_sms(self, phone: str, message: str) -> dict:
        """Send SMS notification via available provider."""
        formatted_phone = self._format_phone_ghana(phone)
        
        if not self.sms_enabled:
            # Mock mode for demo/development
            print(f"[MOCK SMS] To: {formatted_phone}")
            print(f"[MOCK SMS] Message: {message}")
            return {
                "success": True,
                "mock": True,
                "phone": formatted_phone,
                "message": message
            }
        
        # Try providers in order of preference for Ghana
        if self.hubtel_client_id and self.hubtel_client_secret:
            result = self._send_hubtel_sms(formatted_phone, message)
            if result["success"]:
                return result
        
        if self.arkesel_api_key:
            result = self._send_arkesel_sms(formatted_phone, message)
            if result["success"]:
                return result
        
        if self.twilio_sid and self.twilio_token:
            result = self._send_twilio_sms(formatted_phone, message)
            if result["success"]:
                return result
        
        return {"success": False, "error": "No SMS provider configured"}
    
    def send_eta_notification(
        self,
        customer_phone: str,
        customer_name: str,
        eta_minutes: int,
        rider_name: str = None,
        order_id: str = None
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
        
        return self.send_sms(customer_phone, message)
    
    def send_delivery_confirmation(
        self,
        customer_phone: str,
        customer_name: str,
        order_id: str = None
    ) -> dict:
        """Send delivery confirmation to customer."""
        message = f"Hi {customer_name}! Your delivery"
        if order_id:
            message += f" (#{order_id})"
        message += " has been completed. Thank you!"
        
        return self.send_sms(customer_phone, message)
    
    def send_otp(self, customer_phone: str, otp_code: str) -> dict:
        """Send OTP for delivery confirmation."""
        message = f"Your delivery confirmation code is: {otp_code}. Please share this with your rider."
        return self.send_sms(customer_phone, message)
    
    def send_failed_delivery_notice(
        self,
        customer_phone: str,
        customer_name: str,
        reason: str,
        order_id: str = None
    ) -> dict:
        """Notify customer of failed delivery attempt."""
        message = f"Hi {customer_name}, we attempted to deliver your order"
        if order_id:
            message += f" (#{order_id})"
        message += f" but were unable to complete it. Reason: {reason}. We'll try again soon."
        
        return self.send_sms(customer_phone, message)


notification_service = NotificationService()
