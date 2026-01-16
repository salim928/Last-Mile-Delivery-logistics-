"""
Management command to seed demo data for testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.merchants.models import Merchant, BusinessType
from apps.riders.models import Rider, RiderStatus
from apps.orders.models import Order, OrderStatus, VehicleType


class Command(BaseCommand):
    help = 'Seeds the database with demo data including a demo merchant account'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...\n')
        
        # Create demo merchant
        demo_email = 'demo@movva.gh'
        demo_password = 'demo1234'
        
        merchant, created = Merchant.objects.get_or_create(
            email=demo_email,
            defaults={
                'business_name': 'Demo Logistics Ghana',
                'phone_number': '+233201234567',
                'hashed_password': make_password(demo_password),
                'business_type': BusinessType.ECOMMERCE,
                'address': 'Accra Mall, Spintex Road, Accra',
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created demo merchant: {demo_email}'))
        else:
            # Update password if merchant already exists
            merchant.set_password(demo_password)
            merchant.save()
            self.stdout.write(self.style.WARNING(f'→ Demo merchant updated: {demo_email}'))
        
        # Create demo riders
        demo_riders = [
            {
                'name': 'Kwame Asante',
                'phone_number': '+233241111111',
                'vehicle_type': 'motorbike',
                'vehicle_registration': 'GR-1234-20',
                'current_latitude': 5.6037,
                'current_longitude': -0.1870,
                'status': RiderStatus.AVAILABLE,
            },
            {
                'name': 'Ama Serwaa',
                'phone_number': '+233242222222',
                'vehicle_type': 'motorbike',
                'vehicle_registration': 'GR-5678-21',
                'current_latitude': 5.5913,
                'current_longitude': -0.2200,
                'status': RiderStatus.AVAILABLE,
            },
            {
                'name': 'Kofi Mensah',
                'phone_number': '+233243333333',
                'vehicle_type': 'van',
                'vehicle_registration': 'GR-9012-22',
                'current_latitude': 5.6145,
                'current_longitude': -0.2050,
                'status': RiderStatus.AVAILABLE,
            },
        ]
        
        riders_created = 0
        for rider_data in demo_riders:
            rider, created = Rider.objects.get_or_create(
                phone_number=rider_data['phone_number'],
                merchant=merchant,
                defaults=rider_data
            )
            if created:
                riders_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {riders_created} demo riders'))
        
        # Create demo orders
        demo_orders = [
            {
                'customer_name': 'Akosua Mensah',
                'customer_phone': '+233551111111',
                'delivery_address': 'East Legon, Accra',
                'latitude': 5.6350,
                'longitude': -0.1570,
                'package_description': 'Electronics - Laptop',
                'cod_amount': 2500.00,
                'is_cod': True,
                'status': OrderStatus.PENDING,
                'preferred_vehicle': VehicleType.MOTORBIKE,
            },
            {
                'customer_name': 'Yaw Boateng',
                'customer_phone': '+233552222222',
                'delivery_address': 'Osu, Oxford Street, Accra',
                'latitude': 5.5560,
                'longitude': -0.1820,
                'package_description': 'Fashion - Clothing bundle',
                'cod_amount': 450.00,
                'is_cod': True,
                'status': OrderStatus.PENDING,
                'preferred_vehicle': VehicleType.MOTORBIKE,
            },
            {
                'customer_name': 'Efua Owusu',
                'customer_phone': '+233553333333',
                'delivery_address': 'Tema Community 25',
                'latitude': 5.6698,
                'longitude': -0.0166,
                'package_description': 'Groceries - Bulk order',
                'cod_amount': 890.00,
                'is_cod': True,
                'status': OrderStatus.PENDING,
                'preferred_vehicle': VehicleType.VAN,
            },
            {
                'customer_name': 'Kweku Appiah',
                'customer_phone': '+233554444444',
                'delivery_address': 'Adenta Housing Down',
                'latitude': 5.7170,
                'longitude': -0.1670,
                'package_description': 'Documents - Legal papers',
                'cod_amount': 0.00,
                'is_cod': False,
                'status': OrderStatus.PENDING,
                'preferred_vehicle': VehicleType.MOTORBIKE,
            },
            {
                'customer_name': 'Adjoa Sarpong',
                'customer_phone': '+233555555555',
                'delivery_address': 'Spintex Road, Accra',
                'latitude': 5.6365,
                'longitude': -0.1140,
                'package_description': 'Cosmetics - Beauty products',
                'cod_amount': 320.00,
                'is_cod': True,
                'status': OrderStatus.PENDING,
                'preferred_vehicle': VehicleType.MOTORBIKE,
            },
        ]
        
        orders_created = 0
        for order_data in demo_orders:
            # Check if order with same customer phone exists for this merchant
            if not Order.objects.filter(
                merchant=merchant, 
                customer_phone=order_data['customer_phone']
            ).exists():
                Order.objects.create(merchant=merchant, **order_data)
                orders_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {orders_created} demo orders'))
        
        # Set PIN for demo rider (first rider - Kwame Asante)
        demo_rider = Rider.objects.filter(
            merchant=merchant, 
            phone_number='+233241111111'
        ).first()
        
        if demo_rider:
            demo_rider.set_pin('1234')
            demo_rider.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Set PIN for demo rider: {demo_rider.name}'))
        
        # Print login credentials
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('DEMO LOGIN CREDENTIALS'))
        self.stdout.write('='*50)
        self.stdout.write('\nMERCHANT DASHBOARD:')
        self.stdout.write(f'  URL:      http://localhost:3000/login')
        self.stdout.write(f'  Email:    {demo_email}')
        self.stdout.write(f'  Password: {demo_password}')
        self.stdout.write('\nRIDER PORTAL:')
        self.stdout.write(f'  URL:      http://localhost:3000/rider/login')
        self.stdout.write(f'  Phone:    +233241111111')
        self.stdout.write(f'  PIN:      1234')
        self.stdout.write('='*50 + '\n')

