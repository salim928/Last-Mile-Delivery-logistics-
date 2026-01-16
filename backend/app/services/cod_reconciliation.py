"""
Cash-On-Delivery Reconciliation Service. 
"""
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from sqlalchemy. orm import Session
from sqlalchemy import func
from app.models.order import Order, OrderStatus
from app.models.route import Route


@dataclass
class CODSummary:
    """Daily COD reconciliation summary."""
    date: date
    total_cod_orders: int
    total_expected:  float
    total_collected: float
    total_pending: float
    discrepancy: float
    collection_rate: float
    mismatched_orders: List[Dict]


class CODReconciliationService:
    
    def get_daily_summary(
        self,
        db: Session,
        merchant_id: int,
        target_date: date
    ) -> CODSummary:
        """Get COD summary for a specific date."""
        cod_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.is_cod == True,
            func.date(Order.created_at) == target_date
        ).all()
        
        total_expected = sum(o.cod_amount for o in cod_orders)
        total_collected = sum(o.cod_collected or 0 for o in cod_orders)
        
        delivered_orders = [o for o in cod_orders if o.status == OrderStatus.DELIVERED]
        pending_orders = [o for o in cod_orders if o.status in [
            OrderStatus. PENDING, OrderStatus.ASSIGNED, OrderStatus.IN_TRANSIT
        ]]
        
        total_pending = sum(o.cod_amount for o in pending_orders)
        
        mismatched = []
        for order in delivered_orders:
            collected = order.cod_collected or 0
            if abs(collected - order.cod_amount) > 0.01:
                mismatched.append({
                    "order_id": order.id,
                    "external_order_id": order.external_order_id,
                    "customer_name": order.customer_name,
                    "expected":  order.cod_amount,
                    "collected": collected,
                    "difference": order.cod_amount - collected
                })
        
        discrepancy = total_expected - total_collected - total_pending
        collection_rate = (total_collected / total_expected * 100) if total_expected > 0 else 0
        
        return CODSummary(
            date=target_date,
            total_cod_orders=len(cod_orders),
            total_expected=round(total_expected, 2),
            total_collected=round(total_collected, 2),
            total_pending=round(total_pending, 2),
            discrepancy=round(discrepancy, 2),
            collection_rate=round(collection_rate, 1),
            mismatched_orders=mismatched
        )
    
    def get_route_cod_summary(self, db: Session, route_id: int) -> Optional[Dict]:
        """Get COD summary for a specific route."""
        route = db.query(Route).filter(Route.id == route_id).first()
        if not route:
            return None
        
        cod_orders = db.query(Order).filter(
            Order.route_id == route_id,
            Order.is_cod == True
        ).all()
        
        total_expected = sum(o.cod_amount for o in cod_orders)
        total_collected = sum(o.cod_collected or 0 for o in cod_orders)
        
        orders_detail = []
        for order in cod_orders:
            orders_detail.append({
                "order_id":  order.id,
                "customer_name": order.customer_name,
                "status": order. status. value,
                "expected": order.cod_amount,
                "collected": order.cod_collected,
                "sequence": order.route_stop_sequence
            })
        
        return {
            "route_id": route_id,
            "route_date": route.route_date.isoformat(),
            "rider_id":  route.rider_id,
            "total_cod_orders": len(cod_orders),
            "total_expected": round(total_expected, 2),
            "total_collected": round(total_collected, 2),
            "outstanding": round(total_expected - total_collected, 2),
            "orders": sorted(orders_detail, key=lambda x: x.get("sequence") or 999)
        }
    
    def flag_discrepancies(
        self,
        db: Session,
        merchant_id: int,
        threshold_percent: float = 5.0
    ) -> List[Dict]:
        """Find routes/riders with significant COD discrepancies."""
        routes = db.query(Route).filter(
            Route.merchant_id == merchant_id,
            Route.status == "completed"
        ).all()
        
        flagged = []
        for route in routes:
            if route.total_cod_expected > 0:
                discrepancy_percent = (
                    (route.total_cod_expected - route.total_cod_collected)
                    / route.total_cod_expected * 100
                )
                
                if discrepancy_percent > threshold_percent:
                    flagged.append({
                        "route_id": route.id,
                        "route_date": route.route_date.isoformat(),
                        "rider_id": route.rider_id,
                        "expected":  route.total_cod_expected,
                        "collected": route. total_cod_collected,
                        "discrepancy": route.total_cod_expected - route.total_cod_collected,
                        "discrepancy_percent": round(discrepancy_percent, 1)
                    })
        
        return sorted(flagged, key=lambda x: x["discrepancy_percent"], reverse=True)
    
    def get_rider_cod_performance(
        self,
        db: Session,
        merchant_id: int,
        days:  int = 30
    ) -> List[Dict]:
        """Get COD collection performance by rider."""
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        routes = db.query(Route).filter(
            Route.merchant_id == merchant_id,
            Route.route_date >= start_date,
            Route.rider_id. isnot(None)
        ).all()
        
        rider_stats = {}
        for route in routes:
            rider_id = route.rider_id
            if rider_id not in rider_stats:
                rider_stats[rider_id] = {
                    "rider_id": rider_id,
                    "total_routes": 0,
                    "total_expected": 0.0,
                    "total_collected": 0.0
                }
            
            rider_stats[rider_id]["total_routes"] += 1
            rider_stats[rider_id]["total_expected"] += route.total_cod_expected or 0
            rider_stats[rider_id]["total_collected"] += route.total_cod_collected or 0
        
        results = []
        for stats in rider_stats.values():
            collection_rate = (
                stats["total_collected"] / stats["total_expected"] * 100
                if stats["total_expected"] > 0 else 100
            )
            results.append({
                **stats,
                "collection_rate": round(collection_rate, 1),
                "outstanding": round(stats["total_expected"] - stats["total_collected"], 2)
            })
        
        return sorted(results, key=lambda x: x["collection_rate"])


cod_service = CODReconciliationService()