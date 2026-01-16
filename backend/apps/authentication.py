"""
Custom JWT Authentication for Merchant model.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from apps.merchants.models import Merchant


class MerchantJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that works with Merchant model instead of Django User.
    """
    
    def get_user(self, validated_token):
        """
        Override to get Merchant instead of User.
        """
        try:
            merchant_id = validated_token.get('merchant_id')
            if not merchant_id:
                raise InvalidToken('Token contained no merchant_id')
            
            merchant = Merchant.objects.get(id=merchant_id)
            
            if not merchant.is_active:
                raise AuthenticationFailed('Merchant account is deactivated')
            
            return merchant
            
        except Merchant.DoesNotExist:
            raise AuthenticationFailed('Merchant not found')
