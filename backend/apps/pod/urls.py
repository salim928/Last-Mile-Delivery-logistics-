"""
POD URL configuration.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('generate-otp/<int:order_id>/', views.generate_delivery_otp, name='generate-otp'),
    path('verify-otp/', views.verify_delivery_otp, name='verify-otp'),
    path('upload-photo/', views.upload_pod_photo, name='upload-pod-photo'),
    path('', views.create_proof_of_delivery, name='create-pod'),
    path('<int:order_id>/', views.get_proof_of_delivery, name='get-pod'),
]
