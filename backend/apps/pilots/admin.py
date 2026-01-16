from django.contrib import admin
from django.utils.html import format_html
from .models import PilotApplication


@admin.register(PilotApplication)
class PilotApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'company',
        'name',
        'email',
        'phone_link',
        'fleet_size',
        'status_badge',
        'created_at',
    ]
    list_filter = ['status', 'fleet_size', 'created_at']
    search_fields = ['name', 'email', 'company', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'company', 'phone')
        }),
        ('Business Details', {
            'fields': ('fleet_size', 'challenges')
        }),
        ('Status & Tracking', {
            'fields': ('status', 'source', 'contacted_at', 'notes')
        }),
        ('Metadata', {
            'classes': ('collapse',),
            'fields': ('id', 'ip_address', 'user_agent', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['mark_as_contacted', 'mark_as_onboarding', 'mark_as_active']
    
    def phone_link(self, obj):
        wa_number = obj.phone.replace('+', '').replace(' ', '')
        return format_html(
            '<a href="https://wa.me/{}" target="_blank" style="color: #25D366;">📱 {}</a>',
            wa_number,
            obj.phone
        )
    phone_link.short_description = 'Phone'
    
    def status_badge(self, obj):
        colors = {
            'pending': '#f59e0b',
            'contacted': '#3b82f6',
            'onboarding': '#8b5cf6',
            'active': '#10b981',
            'rejected': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def mark_as_contacted(self, request, queryset):
        queryset.update(status='contacted')
    mark_as_contacted.short_description = "Mark selected as Contacted"
    
    def mark_as_onboarding(self, request, queryset):
        queryset.update(status='onboarding')
    mark_as_onboarding.short_description = "Mark selected as Onboarding"
    
    def mark_as_active(self, request, queryset):
        queryset.update(status='active')
    mark_as_active.short_description = "Mark selected as Active Pilot"
