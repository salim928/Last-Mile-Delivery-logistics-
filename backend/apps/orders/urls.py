"""
Orders URL configuration.
"""
from django.urls import path
from . import views

order_viewset = views.OrderViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

order_detail_viewset = views.OrderViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', order_viewset, name='order-list'),
    path('<int:pk>/', order_detail_viewset, name='order-detail'),
    path('bulk/', views.OrderViewSet.as_view({'post': 'bulk'}), name='order-bulk'),
    path('upload-csv/', views.OrderViewSet.as_view({'post': 'upload_csv'}), name='order-upload-csv'),
]
