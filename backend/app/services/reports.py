"""
Report Generation Service - ROI/Savings Reports. 
Generates PDF reports for merchants and investors.
"""
from typing import Optional, List, Dict
from datetime import date, datetime, timedelta
from dataclasses import dataclass
from io import BytesIO
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.order import Order, OrderStatus
from app.models. route import Route
from app.config import settings


@dataclass
class SavingsReport:
    """Comprehensive savings/ROI report."""
    period_start: date
    period_end: date
    merchant_name: str
    
    # Route metrics
    total_routes: int
    total_deliveries: int
    successful_deliveries: int
    failed_deliveries: int
    success_rate: float
    
    # Distance savings
    total_optimized_distance_km: float
    total_naive_distance_km: float
    distance_saved_km: float
    distance_saved_percent: float
    
    # Time savings
    total_optimized_time_minutes: float
    total_naive_time_minutes: float
    time_saved_minutes: float
    time_saved_percent: float
    
    # Cost savings
    fuel_cost_optimized: float
    fuel_cost_naive: float
    fuel_cost_saved: float
    
    # COD metrics
    total_cod_expected: float
    total_cod_collected: float
    cod_collection_rate: float
    
    # Daily breakdown
    daily_stats: List[Dict]


class ReportService:
    
    def generate_savings_report(
        self,
        db: Session,
        merchant_id: int,
        merchant_name: str,
        start_date: date,
        end_date: date
    ) -> SavingsReport:
        """Generate comprehensive savings report for a period."""
        
        # Get all routes in period
        routes = db.query(Route).filter(
            Route. merchant_id == merchant_id,
            Route.route_date >= start_date,
            Route. route_date <= end_date
        ).all()
        
        # Get all orders in period
        orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            func.date(Order.created_at) >= start_date,
            func.date(Order.created_at) <= end_date
        ).all()
        
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
        successful = len([o for o in orders if o.status == OrderStatus.DELIVERED])
        failed = len([o for o in orders if o.status == OrderStatus.FAILED])
        success_rate = (successful / len(orders) * 100) if orders else 0
        
        # COD stats
        cod_orders = [o for o in orders if o. is_cod]
        total_cod_expected = sum(o.cod_amount for o in cod_orders)
        total_cod_collected = sum(o.cod_collected or 0 for o in cod_orders)
        cod_rate = (total_cod_collected / total_cod_expected * 100) if total_cod_expected > 0 else 0
        
        # Daily breakdown
        daily_stats = self._calculate_daily_breakdown(routes, start_date, end_date)
        
        return SavingsReport(
            period_start=start_date,
            period_end=end_date,
            merchant_name=merchant_name,
            total_routes=len(routes),
            total_deliveries=len(orders),
            successful_deliveries=successful,
            failed_deliveries=failed,
            success_rate=round(success_rate, 1),
            total_optimized_distance_km=round(total_optimized_distance, 2),
            total_naive_distance_km=round(total_naive_distance, 2),
            distance_saved_km=round(distance_saved, 2),
            distance_saved_percent=round(distance_saved_percent, 1),
            total_optimized_time_minutes=round(total_optimized_time, 1),
            total_naive_time_minutes=round(total_naive_time, 1),
            time_saved_minutes=round(time_saved, 1),
            time_saved_percent=round(time_saved_percent, 1),
            fuel_cost_optimized=round(fuel_cost_optimized, 2),
            fuel_cost_naive=round(fuel_cost_naive, 2),
            fuel_cost_saved=round(fuel_cost_naive - fuel_cost_optimized, 2),
            total_cod_expected=round(total_cod_expected, 2),
            total_cod_collected=round(total_cod_collected, 2),
            cod_collection_rate=round(cod_rate, 1),
            daily_stats=daily_stats
        )
    
    def _calculate_fuel_cost(self, distance_km: float, vehicle_type: str = "motorbike") -> float:
        """Calculate fuel cost in GHS."""
        consumption = (
            settings.VAN_FUEL_CONSUMPTION
            if vehicle_type == "van"
            else settings.MOTORBIKE_FUEL_CONSUMPTION
        )
        liters = distance_km * consumption
        return liters * settings.FUEL_PRICE_PER_LITER
    
    def _calculate_daily_breakdown(
        self,
        routes: List[Route],
        start_date: date,
        end_date: date
    ) -> List[Dict]:
        """Calculate daily statistics."""
        daily = {}
        
        for route in routes:
            day = route.route_date.isoformat()
            if day not in daily:
                daily[day] = {
                    "date": day,
                    "routes": 0,
                    "stops": 0,
                    "distance_km": 0,
                    "time_minutes": 0,
                    "distance_saved_km": 0
                }
            
            daily[day]["routes"] += 1
            daily[day]["stops"] += route.total_stops or 0
            daily[day]["distance_km"] += route.total_distance_km or 0
            daily[day]["time_minutes"] += route.total_duration_minutes or 0
            daily[day]["distance_saved_km"] += route.distance_saved_km or 0
        
        return sorted(daily.values(), key=lambda x: x["date"])
    
    def generate_pdf_report(self, report:  SavingsReport) -> BytesIO:
        """
        Generate PDF report.
        Using reportlab (free) for PDF generation.
        """
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=20,
            textColor=colors. HexColor('#1a365d')
        )
        story.append(Paragraph("🚚 Delivery Optimization Report", title_style))
        story.append(Paragraph(f"<b>{report.merchant_name}</b>", styles['Heading2']))
        story.append(Paragraph(
            f"Period: {report. period_start} to {report. period_end}",
            styles['Normal']
        ))
        story.append(Spacer(1, 20))
        
        # Summary metrics
        story.append(Paragraph("📊 Key Metrics", styles['Heading2']))
        
        summary_data = [
            ["Metric", "Value"],
            ["Total Routes", str(report.total_routes)],
            ["Total Deliveries", str(report.total_deliveries)],
            ["Success Rate", f"{report.success_rate}%"],
            ["Distance Saved", f"{report.distance_saved_km} km ({report.distance_saved_percent}%)"],
            ["Time Saved", f"{report.time_saved_minutes} min ({report.time_saved_percent}%)"],
            ["Fuel Cost Saved", f"GHS {report.fuel_cost_saved}"],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # COD Section
        story.append(Paragraph("💰 Cash-On-Delivery Summary", styles['Heading2']))
        
        cod_data = [
            ["Metric", "Value"],
            ["Total COD Expected", f"GHS {report. total_cod_expected}"],
            ["Total COD Collected", f"GHS {report.total_cod_collected}"],
            ["Collection Rate", f"{report.cod_collection_rate}%"],
        ]
        
        cod_table = Table(cod_data, colWidths=[3*inch, 2*inch])
        cod_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ]))
        story.append(cod_table)
        story.append(Spacer(1, 30))
        
        # ROI Highlight
        story.append(Paragraph("🎯 Return on Investment", styles['Heading2']))
        
        roi_text = f"""
        By using Last-Mile Optimizer, <b>{report.merchant_name}</b> has achieved:
        <br/><br/>
        • <b>{report.distance_saved_percent}%</b> reduction in total distance traveled
        <br/>
        • <b>{report. time_saved_percent}%</b> reduction in delivery time
        <br/>
        • <b>GHS {report.fuel_cost_saved}</b> saved in fuel costs
        <br/>
        • <b>{report.success_rate}%</b> delivery success rate
        """
        story.append(Paragraph(roi_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_csv_report(self, report: SavingsReport) -> str:
        """Generate CSV report for download."""
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer. writerow(["Last-Mile Optimizer - Savings Report"])
        writer.writerow([f"Merchant: {report.merchant_name}"])
        writer.writerow([f"Period: {report. period_start} to {report. period_end}"])
        writer.writerow([])
        
        # Summary
        writer.writerow(["Summary Metrics"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Routes", report.total_routes])
        writer.writerow(["Total Deliveries", report.total_deliveries])
        writer.writerow(["Successful Deliveries", report.successful_deliveries])
        writer.writerow(["Failed Deliveries", report.failed_deliveries])
        writer.writerow(["Success Rate (%)", report.success_rate])
        writer.writerow([])
        
        # Distance
        writer.writerow(["Distance Metrics"])
        writer.writerow(["Optimized Distance (km)", report.total_optimized_distance_km])
        writer.writerow(["Naive Distance (km)", report.total_naive_distance_km])
        writer.writerow(["Distance Saved (km)", report.distance_saved_km])
        writer.writerow(["Distance Saved (%)", report.distance_saved_percent])
        writer.writerow([])
        
        # Time
        writer.writerow(["Time Metrics"])
        writer.writerow(["Optimized Time (min)", report.total_optimized_time_minutes])
        writer.writerow(["Naive Time (min)", report.total_naive_time_minutes])
        writer.writerow(["Time Saved (min)", report.time_saved_minutes])
        writer.writerow(["Time Saved (%)", report.time_saved_percent])
        writer.writerow([])
        
        # Cost
        writer.writerow(["Cost Metrics (GHS)"])
        writer.writerow(["Fuel Cost (Optimized)", report.fuel_cost_optimized])
        writer.writerow(["Fuel Cost (Naive)", report.fuel_cost_naive])
        writer.writerow(["Fuel Cost Saved", report.fuel_cost_saved])
        writer.writerow([])
        
        # COD
        writer.writerow(["COD Metrics (GHS)"])
        writer.writerow(["Total Expected", report.total_cod_expected])
        writer.writerow(["Total Collected", report.total_cod_collected])
        writer.writerow(["Collection Rate (%)", report.cod_collection_rate])
        writer.writerow([])
        
        # Daily breakdown
        writer.writerow(["Daily Breakdown"])
        writer.writerow(["Date", "Routes", "Stops", "Distance (km)", "Time (min)", "Distance Saved (km)"])
        for day in report.daily_stats:
            writer.writerow([
                day["date"],
                day["routes"],
                day["stops"],
                round(day["distance_km"], 2),
                round(day["time_minutes"], 1),
                round(day["distance_saved_km"], 2)
            ])
        
        return output.getvalue()


report_service = ReportService()