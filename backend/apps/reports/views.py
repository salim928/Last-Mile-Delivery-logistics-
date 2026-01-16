"""
Reports API views.
"""
from datetime import date, timedelta
from io import BytesIO
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.services.reports import report_service
from apps.services.cod_reconciliation import cod_service


@api_view(['GET'])
def get_savings_report(request):
    """Get savings/ROI report for a date range."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    else:
        start_date = date.fromisoformat(start_date)
    
    if not end_date:
        end_date = date.today()
    else:
        end_date = date.fromisoformat(end_date)
    
    report = report_service.generate_savings_report(
        merchant_id=request.merchant.id,
        merchant_name=request.merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    return Response({
        'period_start': report['period_start'],
        'period_end': report['period_end'],
        'merchant_name': report['merchant_name'],
        'summary': {
            'total_routes': report['total_routes'],
            'total_deliveries': report['total_deliveries'],
            'successful_deliveries': report['successful_deliveries'],
            'failed_deliveries': report['failed_deliveries'],
            'success_rate_percent': report['success_rate']
        },
        'distance_savings': {
            'optimized_km': report['total_optimized_distance_km'],
            'naive_km': report['total_naive_distance_km'],
            'saved_km': report['distance_saved_km'],
            'saved_percent': report['distance_saved_percent']
        },
        'time_savings': {
            'optimized_minutes': report['total_optimized_time_minutes'],
            'naive_minutes': report['total_naive_time_minutes'],
            'saved_minutes': report['time_saved_minutes'],
            'saved_percent': report['time_saved_percent']
        },
        'cost_savings': {
            'fuel_cost_optimized': report['fuel_cost_optimized'],
            'fuel_cost_naive': report['fuel_cost_naive'],
            'fuel_cost_saved': report['fuel_cost_saved'],
            'currency': 'GHS'
        },
        'cod_metrics': {
            'total_expected': report['total_cod_expected'],
            'total_collected': report['total_cod_collected'],
            'collection_rate_percent': report['cod_collection_rate']
        },
        'daily_breakdown': report['daily_stats']
    })


@api_view(['GET'])
def download_savings_report_pdf(request):
    """Download savings report as PDF."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    else:
        start_date = date.fromisoformat(start_date)
    
    if not end_date:
        end_date = date.today()
    else:
        end_date = date.fromisoformat(end_date)
    
    report = report_service.generate_savings_report(
        merchant_id=request.merchant.id,
        merchant_name=request.merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    pdf_buffer = report_service.generate_pdf_report(report)
    
    response = HttpResponse(pdf_buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename=savings_report_{start_date}_{end_date}.pdf'
    return response


@api_view(['GET'])
def download_savings_report_csv(request):
    """Download savings report as CSV."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    else:
        start_date = date.fromisoformat(start_date)
    
    if not end_date:
        end_date = date.today()
    else:
        end_date = date.fromisoformat(end_date)
    
    report = report_service.generate_savings_report(
        merchant_id=request.merchant.id,
        merchant_name=request.merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    csv_content = report_service.generate_csv_report(report)
    
    response = HttpResponse(csv_content, content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename=savings_report_{start_date}_{end_date}.csv'
    return response


@api_view(['GET'])
def get_daily_cod_report(request):
    """Get daily COD reconciliation report."""
    target_date = request.query_params.get('date')
    
    if not target_date:
        target_date = date.today()
    else:
        target_date = date.fromisoformat(target_date)
    
    report = cod_service.get_daily_summary(
        merchant_id=request.merchant.id,
        target_date=target_date
    )
    
    return Response(report)


@api_view(['GET'])
def get_route_cod_summary(request, route_id):
    """Get COD summary for a specific route."""
    report = cod_service.get_route_cod_summary(route_id=route_id)
    
    if not report:
        return Response(
            {'detail': 'Route not found'},
            status=404
        )
    
    return Response(report)


@api_view(['GET'])
def get_cod_discrepancies(request):
    """Find routes/riders with significant COD discrepancies."""
    threshold = float(request.query_params.get('threshold', 5.0))
    
    flagged = cod_service.flag_discrepancies(
        merchant_id=request.merchant.id,
        threshold_percent=threshold
    )
    
    return Response(flagged)


@api_view(['GET'])
def get_rider_cod_performance(request):
    """Get COD performance metrics by rider."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    else:
        start_date = date.fromisoformat(start_date)
    
    if not end_date:
        end_date = date.today()
    else:
        end_date = date.fromisoformat(end_date)
    
    performance = cod_service.get_rider_cod_performance(
        merchant_id=request.merchant.id,
        start_date=start_date,
        end_date=end_date
    )
    
    return Response(performance)
