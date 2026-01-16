"""
Custom middleware for merchant and rider authentication.
"""
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from apps.merchants.models import Merchant


class MerchantAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to attach merchant and/or rider to request from JWT token.
    """
    
    def process_request(self, request):
        """Extract merchant/rider from JWT and attach to request."""
        auth_header = request.headers.get('Authorization', '')
        
        request.merchant = None
        request.rider_id = None
        request.is_rider = False
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            
            # Check if this is a rider token
            if validated_token.get('is_rider'):
                request.rider_id = validated_token.get('rider_id')
                request.is_rider = True
            
            # Always try to get merchant (rider tokens have merchant_id too via user_id)
            merchant_id = validated_token.get('merchant_id') or validated_token.get('user_id')
            if merchant_id:
                try:
                    merchant = Merchant.objects.get(id=merchant_id)
                    if merchant.is_active:
                        request.merchant = merchant
                except Merchant.DoesNotExist:
                    pass
                
        except (InvalidToken, AuthenticationFailed):
            pass
        
        return None
