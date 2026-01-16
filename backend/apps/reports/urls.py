"""
Reports URL configuration.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('savings/', views.get_savings_report, name='savings-report'),
    path('savings/pdf/', views.download_savings_report_pdf, name='savings-report-pdf'),
    path('savings/csv/', views.download_savings_report_csv, name='savings-report-csv'),
    path('cod/daily/', views.get_daily_cod_report, name='cod-daily'),
    path('cod/route/<int:route_id>/', views.get_route_cod_summary, name='cod-route'),
    path('cod/discrepancies/', views.get_cod_discrepancies, name='cod-discrepancies'),
    path('cod/rider-performance/', views.get_rider_cod_performance, name='cod-rider-performance'),
]
