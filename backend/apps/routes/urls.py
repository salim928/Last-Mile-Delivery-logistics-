"""
Routes URL configuration.
"""
from django.urls import path
from . import views

route_viewset = views.RouteViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

route_detail_viewset = views.RouteViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', route_viewset, name='route-list'),
    path('<int:pk>/', route_detail_viewset, name='route-detail'),
    path('<int:pk>/optimize/', views.RouteViewSet.as_view({'post': 'optimize'}), name='route-optimize'),
    path('<int:pk>/assign/', views.RouteViewSet.as_view({'post': 'assign'}), name='route-assign'),
    path('<int:pk>/start/', views.RouteViewSet.as_view({'post': 'start'}), name='route-start'),
    path('<int:pk>/complete/', views.RouteViewSet.as_view({'post': 'complete'}), name='route-complete'),
    path('<int:pk>/export/pdf/', views.RouteViewSet.as_view({'get': 'export_pdf'}), name='route-export-pdf'),
    path('<int:pk>/export/csv/', views.RouteViewSet.as_view({'get': 'export_csv'}), name='route-export-csv'),
]
