"""
Reports API endpoints.
"""
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.merchant import Merchant
from app.services.auth import get_current_merchant
from app.services.reports import report_service, SavingsReport
from app.services.cod_reconciliation import cod_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/savings")
async def get_savings_report(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get savings/ROI report for a date range."""
    if not start_date: 
        start_date = date. today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    report = report_service.generate_savings_report(
        db=db,
        merchant_id=current_merchant.id,
        merchant_name=current_merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    return {
        "period_start": report.period_start.isoformat(),
        "period_end": report.period_end. isoformat(),
        "merchant_name": report.merchant_name,
        "summary": {
            "total_routes": report.total_routes,
            "total_deliveries": report.total_deliveries,
            "successful_deliveries": report.successful_deliveries,
            "failed_deliveries": report.failed_deliveries,
            "success_rate_percent": report.success_rate
        },
        "distance_savings": {
            "optimized_km": report.total_optimized_distance_km,
            "naive_km": report.total_naive_distance_km,
            "saved_km": report.distance_saved_km,
            "saved_percent": report.distance_saved_percent
        },
        "time_savings": {
            "optimized_minutes": report.total_optimized_time_minutes,
            "naive_minutes": report.total_naive_time_minutes,
            "saved_minutes": report.time_saved_minutes,
            "saved_percent": report.time_saved_percent
        },
        "cost_savings": {
            "fuel_cost_optimized": report.fuel_cost_optimized,
            "fuel_cost_naive": report.fuel_cost_naive,
            "fuel_cost_saved": report.fuel_cost_saved,
            "currency": "GHS"
        },
        "cod_metrics": {
            "total_expected":  report.total_cod_expected,
            "total_collected": report.total_cod_collected,
            "collection_rate_percent": report.cod_collection_rate
        },
        "daily_breakdown": report.daily_stats
    }


@router.get("/savings/pdf")
async def download_savings_report_pdf(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Download savings report as PDF."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date: 
        end_date = date.today()
    
    report = report_service.generate_savings_report(
        db=db,
        merchant_id=current_merchant.id,
        merchant_name=current_merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    pdf_buffer = report_service.generate_pdf_report(report)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=savings_report_{start_date}_{end_date}.pdf"
        }
    )


@router.get("/savings/csv")
async def download_savings_report_csv(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Download savings report as CSV."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    report = report_service.generate_savings_report(
        db=db,
        merchant_id=current_merchant. id,
        merchant_name=current_merchant.business_name,
        start_date=start_date,
        end_date=end_date
    )
    
    csv_content = report_service.generate_csv_report(report)
    
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=savings_report_{start_date}_{end_date}.csv"
        }
    )


@router.get("/cod/daily")
async def get_daily_cod_report(
    target_date: date = Query(default=None),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get daily COD reconciliation report."""
    if not target_date:
        target_date = date.today()
    
    summary = cod_service.get_daily_summary(
        db=db,
        merchant_id=current_merchant.id,
        target_date=target_date
    )
    
    return {
        "date": summary.date. isoformat(),
        "total_cod_orders": summary.total_cod_orders,
        "total_expected": summary.total_expected,
        "total_collected": summary. total_collected,
        "total_pending": summary.total_pending,
        "discrepancy": summary.discrepancy,
        "collection_rate_percent": summary.collection_rate,
        "mismatched_orders": summary.mismatched_orders
    }


@router.get("/cod/route/{route_id}")
async def get_route_cod_report(
    route_id: int,
    db: Session = Depends(get_db),
    current_merchant:  Merchant = Depends(get_current_merchant)
):
    """Get COD summary for a specific route."""
    summary = cod_service.get_route_cod_summary(db=db, route_id=route_id)
    
    if not summary:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    return summary


@router.get("/cod/discrepancies")
async def get_cod_discrepancies(
    threshold_percent: float = Query(default=5.0),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get routes with COD discrepancies above threshold."""
    flagged = cod_service.flag_discrepancies(
        db=db,
        merchant_id=current_merchant.id,
        threshold_percent=threshold_percent
    )
    
    return {"flagged_routes": flagged, "threshold_percent": threshold_percent}


@router.get("/cod/rider-performance")
async def get_rider_cod_performance(
    days:  int = Query(default=30, le=90),
    db: Session = Depends(get_db),
    current_merchant: Merchant = Depends(get_current_merchant)
):
    """Get COD collection performance by rider."""
    performance = cod_service.get_rider_cod_performance(
        db=db,
        merchant_id=current_merchant.id,
        days=days
    )
    
    return {"period_days": days, "rider_performance": performance}