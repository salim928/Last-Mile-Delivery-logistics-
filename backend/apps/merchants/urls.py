"""
Merchant authentication URLs.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.get_current_merchant, name='me'),
    path('change-password/', views.change_password, name='change-password'),
]
