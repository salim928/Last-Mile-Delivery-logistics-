"""
Paystack payment integration for Ghana
Supports mobile money, cards, and bank transfers
"""
from typing import Optional, Dict
from decimal import Decimal
import requests
from django.conf import settings


class PaystackService:
    """Service for processing payments via Paystack"""
    
    BASE_URL = "https://api.paystack.co"
    
    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }
    
    def initialize_transaction(
        self,
        email: str,
        amount: Decimal,
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict] = None,
        channels: Optional[list] = None,
    ) -> Dict:
        """
        Initialize a payment transaction
        
        Args:
            email: Customer email
            amount: Amount in GHS (will be converted to pesewas)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional transaction metadata
            channels: Payment channels (card, mobile_money, bank, etc.)
        
        Returns:
            Dict with authorization_url and access_code
        """
        # Convert amount to pesewas (Paystack expects smallest currency unit)
        amount_pesewas = int(amount * 100)
        
        payload = {
            "email": email,
            "amount": amount_pesewas,
            "reference": reference,
            "currency": "GHS",
        }
        
        if callback_url:
            payload["callback_url"] = callback_url
        
        if metadata:
            payload["metadata"] = metadata
        
        if channels:
            payload["channels"] = channels
        else:
            # Default: enable all channels including mobile money
            payload["channels"] = ["card", "mobile_money", "bank"]
        
        response = requests.post(
            f"{self.BASE_URL}/transaction/initialize",
            json=payload,
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get("status"):
            return data["data"]
        else:
            raise Exception(data.get("message", "Payment initialization failed"))
    
    def verify_transaction(self, reference: str) -> Dict:
        """
        Verify a transaction
        
        Args:
            reference: Transaction reference to verify
        
        Returns:
            Dict with transaction details including status
        """
        response = requests.get(
            f"{self.BASE_URL}/transaction/verify/{reference}",
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get("status"):
            return data["data"]
        else:
            raise Exception(data.get("message", "Verification failed"))
    
    def list_banks(self) -> list:
        """Get list of available banks for Ghana"""
        response = requests.get(
            f"{self.BASE_URL}/bank?country=ghana",
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get("status"):
            return data["data"]
        return []
    
    def create_subscription(
        self,
        customer_email: str,
        plan_code: str,
        authorization_code: str,
    ) -> Dict:
        """
        Create a subscription for recurring billing
        
        Args:
            customer_email: Customer email
            plan_code: Paystack plan code
            authorization_code: Authorization code from successful transaction
        
        Returns:
            Subscription details
        """
        payload = {
            "customer": customer_email,
            "plan": plan_code,
            "authorization": authorization_code,
        }
        
        response = requests.post(
            f"{self.BASE_URL}/subscription",
            json=payload,
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get("status"):
            return data["data"]
        else:
            raise Exception(data.get("message", "Subscription creation failed"))
    
    def cancel_subscription(self, subscription_code: str, email_token: str) -> bool:
        """Cancel a subscription"""
        payload = {
            "code": subscription_code,
            "token": email_token,
        }
        
        response = requests.post(
            f"{self.BASE_URL}/subscription/disable",
            json=payload,
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        return data.get("status", False)
    
    def create_plan(
        self,
        name: str,
        amount: Decimal,
        interval: str = "monthly",
        description: Optional[str] = None,
    ) -> Dict:
        """
        Create a subscription plan
        
        Args:
            name: Plan name
            amount: Plan amount in GHS
            interval: Billing interval (monthly, annually)
            description: Plan description
        
        Returns:
            Plan details with plan_code
        """
        amount_pesewas = int(amount * 100)
        
        payload = {
            "name": name,
            "amount": amount_pesewas,
            "interval": interval,
            "currency": "GHS",
        }
        
        if description:
            payload["description"] = description
        
        response = requests.post(
            f"{self.BASE_URL}/plan",
            json=payload,
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()
        
        data = response.json()
        if data.get("status"):
            return data["data"]
        else:
            raise Exception(data.get("message", "Plan creation failed"))


# Singleton instance
paystack = PaystackService()
