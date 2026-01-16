"""
Report Generation Service - ROI/Savings Reports.
Generates PDF reports for merchants and investors.
"""
from typing import List, Dict
from datetime import date, timedelta
from io import BytesIO
from django.conf import settings
from django.db.models import Sum, Count, Q

from apps.orders.models import Order, OrderStatus
from apps.routes.models import Route


class ReportService:
    
    def generate_savings_report(
        self,
        merchant_id: int,
        merchant_name: str,
        start_date: date,
        end_date: date
    ) -> Dict:
        """Generate comprehensive savings report for a period."""
        
        # Get all routes in period
        routes = Route.objects.filter(
            merchant_id=merchant_id,
            route_date__gte=start_date,
            route_date__lte=end_date
        )
        
        # Get all orders in period
        orders = Order.objects.filter(
            merchant_id=merchant_id,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        # Calculate aggregates
        total_optimized_distance = sum(r.total_distance_km or 0 for r in routes)
        total_naive_distance = sum(r.naive_distance_km or r.total_distance_km or 0 for r in routes)
        total_optimized_time = sum(r.total_duration_minutes or 0 for r in routes)
        total_naive_time = sum(r.naive_duration_minutes or r.total_duration_minutes or 0 for r in routes)
        
        distance_saved = total_naive_distance - total_optimized_distance
        time_saved = total_naive_time - total_optimized_time
        
        distance_saved_percent = (
            (distance_saved / total_naive_distance * 100)
            if total_naive_distance > 0 else 0
        )
        time_saved_percent = (
            (time_saved / total_naive_time * 100)
            if total_naive_time > 0 else 0
        )
        
        # Fuel costs
        fuel_cost_optimized = self._calculate_fuel_cost(total_optimized_distance)
        fuel_cost_naive = self._calculate_fuel_cost(total_naive_distance)
        
        # Delivery stats
        successful = orders.filter(status=OrderStatus.DELIVERED).count()
        failed = orders.filter(status=OrderStatus.FAILED).count()
        total_orders = orders.count()
        success_rate = (successful / total_orders * 100) if total_orders else 0
        
        # COD stats
        cod_orders = orders.filter(is_cod=True)
        total_cod_expected = sum(o.cod_amount for o in cod_orders)
        total_cod_collected = sum(o.cod_collected or 0 for o in cod_orders)
        cod_rate = (total_cod_collected / total_cod_expected * 100) if total_cod_expected > 0 else 0
        
        # Daily breakdown
        daily_stats = self._calculate_daily_breakdown(routes, start_date, end_date)
        
        return {
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'merchant_name': merchant_name,
            'total_routes': routes.count(),
            'total_deliveries': total_orders,
            'successful_deliveries': successful,
            'failed_deliveries': failed,
            'success_rate': round(success_rate, 1),
            'total_optimized_distance_km': round(total_optimized_distance, 2),
            'total_naive_distance_km': round(total_naive_distance, 2),
            'distance_saved_km': round(distance_saved, 2),
            'distance_saved_percent': round(distance_saved_percent, 1),
            'total_optimized_time_minutes': round(total_optimized_time, 1),
            'total_naive_time_minutes': round(total_naive_time, 1),
            'time_saved_minutes': round(time_saved, 1),
            'time_saved_percent': round(time_saved_percent, 1),
            'fuel_cost_optimized': round(fuel_cost_optimized, 2),
            'fuel_cost_naive': round(fuel_cost_naive, 2),
            'fuel_cost_saved': round(fuel_cost_naive - fuel_cost_optimized, 2),
            'total_cod_expected': round(total_cod_expected, 2),
            'total_cod_collected': round(total_cod_collected, 2),
            'cod_collection_rate': round(cod_rate, 1),
            'daily_stats': daily_stats
        }
    
    def _calculate_fuel_cost(self, distance_km: float, vehicle_type: str = "motorbike") -> float:
        """Calculate fuel cost in GHS."""
        consumption = (
            settings.VAN_FUEL_CONSUMPTION
            if vehicle_type == "van"
            else settings.MOTORBIKE_FUEL_CONSUMPTION
        )
        
        liters_needed = distance_km * consumption
        cost = liters_needed * settings.FUEL_PRICE_PER_LITER
        
        return round(cost, 2)
    
    def _calculate_daily_breakdown(
        self,
        routes,
        start_date: date,
        end_date: date
    ) -> List[Dict]:
        """Calculate daily statistics."""
        daily_stats = []
        current_date = start_date
        
        while current_date <= end_date:
            day_routes = [r for r in routes if r.route_date == current_date]
            
            if day_routes:
                daily_stats.append({
                    'date': current_date.isoformat(),
                    'routes': len(day_routes),
                    'distance_km': round(sum(r.total_distance_km or 0 for r in day_routes), 2),
                    'saved_km': round(sum(r.distance_saved_km or 0 for r in day_routes), 2),
                    'fuel_cost': round(sum(r.estimated_fuel_cost or 0 for r in day_routes), 2),
                    'cod_expected': round(sum(r.total_cod_expected or 0 for r in day_routes), 2),
                    'cod_collected': round(sum(r.total_cod_collected or 0 for r in day_routes), 2)
                })
            
            current_date += timedelta(days=1)
        
        return daily_stats
    
    def generate_pdf_report(self, report: Dict) -> BytesIO:
        """Generate PDF report."""
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph("Route Optimization Savings Report", title_style))
        elements.append(Spacer(1, 12))
        
        # Period info
        elements.append(Paragraph(f"<b>Merchant:</b> {report['merchant_name']}", styles['Normal']))
        elements.append(Paragraph(f"<b>Period:</b> {report['period_start']} to {report['period_end']}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Summary table
        summary_data = [
            ['Metric', 'Value'],
            ['Total Routes', str(report['total_routes'])],
            ['Total Deliveries', str(report['total_deliveries'])],
            ['Success Rate', f"{report['success_rate']}%"],
            ['Distance Saved', f"{report['distance_saved_km']} km ({report['distance_saved_percent']}%)"],
            ['Time Saved', f"{report['time_saved_minutes']} minutes ({report['time_saved_percent']}%)"],
            ['Fuel Cost Saved', f"GHS {report['fuel_cost_saved']}"],
            ['COD Collection Rate', f"{report['cod_collection_rate']}%"]
        ]
        
        summary_table = Table(summary_data, colWidths=[200, 200])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(summary_table)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    def generate_csv_report(self, report: Dict) -> str:
        """Generate CSV report."""
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['Route Optimization Savings Report'])
        writer.writerow(['Merchant', report['merchant_name']])
        writer.writerow(['Period', f"{report['period_start']} to {report['period_end']}"])
        writer.writerow([])
        
        # Summary
        writer.writerow(['Summary'])
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Routes', report['total_routes']])
        writer.writerow(['Total Deliveries', report['total_deliveries']])
        writer.writerow(['Successful Deliveries', report['successful_deliveries']])
        writer.writerow(['Failed Deliveries', report['failed_deliveries']])
        writer.writerow(['Success Rate (%)', report['success_rate']])
        writer.writerow(['Optimized Distance (km)', report['total_optimized_distance_km']])
        writer.writerow(['Naive Distance (km)', report['total_naive_distance_km']])
        writer.writerow(['Distance Saved (km)', report['distance_saved_km']])
        writer.writerow(['Distance Saved (%)', report['distance_saved_percent']])
        writer.writerow(['Time Saved (minutes)', report['time_saved_minutes']])
        writer.writerow(['Fuel Cost Optimized (GHS)', report['fuel_cost_optimized']])
        writer.writerow(['Fuel Cost Saved (GHS)', report['fuel_cost_saved']])
        writer.writerow(['COD Expected (GHS)', report['total_cod_expected']])
        writer.writerow(['COD Collected (GHS)', report['total_cod_collected']])
        writer.writerow(['COD Collection Rate (%)', report['cod_collection_rate']])
        writer.writerow([])
        
        # Daily breakdown
        if report['daily_stats']:
            writer.writerow(['Daily Breakdown'])
            writer.writerow(['Date', 'Routes', 'Distance (km)', 'Saved (km)', 'Fuel Cost (GHS)', 'COD Expected', 'COD Collected'])
            for day in report['daily_stats']:
                writer.writerow([
                    day['date'],
                    day['routes'],
                    day['distance_km'],
                    day['saved_km'],
                    day['fuel_cost'],
                    day['cod_expected'],
                    day['cod_collected']
                ])
        
        return output.getvalue()


report_service = ReportService()
