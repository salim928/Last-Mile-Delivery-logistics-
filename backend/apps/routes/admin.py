from django.contrib import admin
from .models import Route, RouteStop


class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 0
    raw_id_fields = ['order']


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'route_date', 'status', 'total_stops', 'total_distance_km', 'rider']
    list_filter = ['status', 'route_date', 'vehicle_type']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['merchant', 'rider']
    inlines = [RouteStopInline]


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ['id', 'route', 'order', 'sequence', 'status']
    list_filter = ['status']
    raw_id_fields = ['route', 'order']
