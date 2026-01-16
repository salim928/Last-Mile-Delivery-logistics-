"""
Cash-On-Delivery Reconciliation Service.
"""
from typing import List, Dict, Optional
from datetime import date, timedelta
from django.db.models import Sum, Count, Q

from apps.orders.models import Order, OrderStatus
from apps.routes.models import Route


class CODReconciliationService:
    
    def get_daily_summary(
        self,
        merchant_id: int,
        target_date: date
    ) -> Dict:
        """Get COD summary for a specific date."""
        cod_orders = Order.objects.filter(
            merchant_id=merchant_id,
            is_cod=True,
            created_at__date=target_date
        )
        
        total_expected = sum(o.cod_amount for o in cod_orders)
        total_collected = sum(o.cod_collected or 0 for o in cod_orders)
        
        delivered_orders = cod_orders.filter(status=OrderStatus.DELIVERED)
        pending_orders = cod_orders.filter(
            status__in=[OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.IN_TRANSIT]
        )
        
        total_pending = sum(o.cod_amount for o in pending_orders)
        
        mismatched = []
        for order in delivered_orders:
            collected = order.cod_collected or 0
            if abs(collected - order.cod_amount) > 0.01:
                mismatched.append({
                    'order_id': order.id,
                    'external_order_id': order.external_order_id,
                    'customer_name': order.customer_name,
                    'expected': order.cod_amount,
                    'collected': collected,
                    'difference': order.cod_amount - collected
                })
        
        discrepancy = total_expected - total_collected - total_pending
        collection_rate = (total_collected / total_expected * 100) if total_expected > 0 else 0
        
        return {
            'date': target_date.isoformat(),
            'total_cod_orders': cod_orders.count(),
            'total_expected': round(total_expected, 2),
            'total_collected': round(total_collected, 2),
            'total_pending': round(total_pending, 2),
            'discrepancy': round(discrepancy, 2),
            'collection_rate': round(collection_rate, 1),
            'mismatched_orders': mismatched
        }
    
    def get_route_cod_summary(self, route_id: int) -> Optional[Dict]:
        """Get COD summary for a specific route."""
        try:
            route = Route.objects.get(id=route_id)
        except Route.DoesNotExist:
            return None
        
        cod_orders = Order.objects.filter(
            route_id=route_id,
            is_cod=True
        )
        
        total_expected = sum(o.cod_amount for o in cod_orders)
        total_collected = sum(o.cod_collected or 0 for o in cod_orders)
        
        orders_detail = []
        for order in cod_orders:
            orders_detail.append({
                'order_id': order.id,
                'customer_name': order.customer_name,
                'status': order.status,
                'expected': order.cod_amount,
                'collected': order.cod_collected,
                'sequence': order.route_stop_sequence
            })
        
        return {
            'route_id': route_id,
            'route_date': route.route_date.isoformat(),
            'rider_id': route.rider_id,
            'total_cod_orders': len(orders_detail),
            'total_expected': round(total_expected, 2),
            'total_collected': round(total_collected, 2),
            'outstanding': round(total_expected - total_collected, 2),
            'orders': sorted(orders_detail, key=lambda x: x.get('sequence') or 999)
        }
    
    def flag_discrepancies(
        self,
        merchant_id: int,
        threshold_percent: float = 5.0
    ) -> List[Dict]:
        """Find routes/riders with significant COD discrepancies."""
        routes = Route.objects.filter(
            merchant_id=merchant_id,
            status='completed'
        )
        
        flagged = []
        for route in routes:
            if route.total_cod_expected and route.total_cod_expected > 0:
                discrepancy_percent = (
                    (route.total_cod_expected - (route.total_cod_collected or 0))
                    / route.total_cod_expected * 100
                )
                
                if discrepancy_percent > threshold_percent:
                    flagged.append({
                        'route_id': route.id,
                        'route_date': route.route_date.isoformat(),
                        'rider_id': route.rider_id,
                        'expected': route.total_cod_expected,
                        'collected': route.total_cod_collected or 0,
                        'discrepancy': route.total_cod_expected - (route.total_cod_collected or 0),
                        'discrepancy_percent': round(discrepancy_percent, 1)
                    })
        
        return sorted(flagged, key=lambda x: x['discrepancy_percent'], reverse=True)
    
    def get_rider_cod_performance(
        self,
        merchant_id: int,
        start_date: date = None,
        end_date: date = None
    ) -> List[Dict]:
        """Get COD performance metrics by rider."""
        from apps.riders.models import Rider
        
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        riders = Rider.objects.filter(merchant_id=merchant_id)
        performance = []
        
        for rider in riders:
            routes = Route.objects.filter(
                rider=rider,
                route_date__gte=start_date,
                route_date__lte=end_date,
                status='completed'
            )
            
            total_expected = sum(r.total_cod_expected or 0 for r in routes)
            total_collected = sum(r.total_cod_collected or 0 for r in routes)
            
            collection_rate = (
                (total_collected / total_expected * 100)
                if total_expected > 0 else 100
            )
            
            performance.append({
                'rider_id': rider.id,
                'rider_name': rider.name,
                'total_routes': routes.count(),
                'total_expected': round(total_expected, 2),
                'total_collected': round(total_collected, 2),
                'outstanding': round(total_expected - total_collected, 2),
                'collection_rate': round(collection_rate, 1)
            })
        
        return sorted(performance, key=lambda x: x['collection_rate'], reverse=True)


cod_service = CODReconciliationService()
