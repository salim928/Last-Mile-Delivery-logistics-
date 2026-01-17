"""
Riders URL configuration.
"""
from django.urls import path
from . import views

rider_viewset = views.RiderViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

rider_detail_viewset = views.RiderViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    # Merchant-facing rider management
    path('', rider_viewset, name='rider-list'),
    path('<int:pk>/', rider_detail_viewset, name='rider-detail'),
    path('<int:pk>/location/', views.RiderViewSet.as_view({'post': 'update_location'}), name='rider-location'),
    path('<int:pk>/set-pin/', views.RiderViewSet.as_view({'post': 'set_pin'}), name='rider-set-pin-merchant'),
    path('<int:pk>/performance/', views.RiderViewSet.as_view({'get': 'performance'}), name='rider-performance'),
    
    # Rider portal endpoints (mobile app / web portal)
    path('auth/login/', views.rider_login, name='rider-login'),
    path('auth/set-pin/', views.rider_set_pin, name='rider-set-pin'),
    path('portal/me/', views.rider_me, name='rider-me'),
    path('portal/active-route/', views.rider_active_route, name='rider-active-route'),
    path('portal/update-location/', views.rider_update_location, name='rider-update-location'),
    path('portal/complete-delivery/<int:stop_id>/', views.rider_complete_delivery, name='rider-complete-delivery'),
    path('portal/history/', views.rider_delivery_history, name='rider-delivery-history'),
    path('portal/go-offline/', views.rider_go_offline, name='rider-go-offline'),
]
