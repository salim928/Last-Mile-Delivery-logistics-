from django.urls import path
from . import views

urlpatterns = [
    path('apply/', views.submit_pilot_application, name='pilot-apply'),
    path('stats/', views.pilot_stats, name='pilot-stats'),
]
