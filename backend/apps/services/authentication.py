"""
Authentication utilities for DRF.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from apps.merchants.models import Merchant


class MerchantJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that returns a Merchant instead of User."""
    
    def get_user(self, validated_token):
        """
        Get merchant from the validated JWT token.
        """
        merchant_id = validated_token.get('merchant_id')
        if not merchant_id:
            raise InvalidToken('Token contained no valid merchant identification')
        
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            raise InvalidToken('Merchant not found')
        
        if not merchant.is_active:
            raise InvalidToken('Merchant account is deactivated')
        
        return merchant
