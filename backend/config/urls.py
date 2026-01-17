"""
URL configuration for Last-Mile Logistics Platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def root(request):
    """API root endpoint."""
    return Response({
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs/"
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({"status": "healthy"})


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Root endpoints
    path('', root, name='root'),
    path('health/', health_check, name='health'),
    
    # API v1 endpoints
    path('api/v1/auth/', include('apps.merchants.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/riders/', include('apps.riders.urls')),
    path('api/v1/pod/', include('apps.pod.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/pilots/', include('apps.pilots.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
