"""
Django settings for Last-Mile Logistics Optimization Platform.
All services use free tiers or self-hosted options.
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-change-in-production-min-32-chars')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=Csv())

# ============================================
# Sentry Error Monitoring
# ============================================
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN and not DEBUG:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
        ],
        traces_sample_rate=0.1,  # 10% of transactions
        send_default_pii=False,  # Don't send personal data
        environment='production' if not DEBUG else 'development',
    )

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'apps.merchants',
    'apps.orders',
    'apps.routes',
    'apps.riders',
    'apps.pod',
    'apps.reports',
    'apps.pilots',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.middleware.MerchantAuthenticationMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database - SQLite for local development, PostgreSQL for production
DATABASE_URL = config('DATABASE_URL', default='sqlite:///db.sqlite3')

if DATABASE_URL.startswith('sqlite'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Accra'  # Ghana timezone
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (uploads)
MEDIA_URL = '/uploads/'
MEDIA_ROOT = BASE_DIR / 'uploads'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.authentication.MerchantJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
    'DATE_FORMAT': '%Y-%m-%d',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'merchant_id',
}

# ============================================
# Application-specific settings
# ============================================

APP_NAME = config('APP_NAME', default='Last-Mile Optimizer')
APP_VERSION = config('APP_VERSION', default='1.0.0')

# Free Geocoding Service (Nominatim - OpenStreetMap)
NOMINATIM_URL = config('NOMINATIM_URL', default='https://nominatim.openstreetmap.org')
NOMINATIM_USER_AGENT = config('NOMINATIM_USER_AGENT', default='MovvaOptimizer/1.0')

# Free Routing Service (OSRM - self-hosted or public demo)
OSRM_URL = config('OSRM_URL', default='http://router.project-osrm.org')

# File Storage paths
UPLOAD_DIR = str(MEDIA_ROOT)
POD_IMAGES_DIR = str(MEDIA_ROOT / 'pod')

# SMS/WhatsApp Providers
SMS_ENABLED = config('SMS_ENABLED', default=False, cast=bool)

# Hubtel Ghana (recommended)
HUBTEL_CLIENT_ID = config('HUBTEL_CLIENT_ID', default='')
HUBTEL_CLIENT_SECRET = config('HUBTEL_CLIENT_SECRET', default='')
HUBTEL_SENDER_ID = config('HUBTEL_SENDER_ID', default='Movva')

# Arkesel Ghana (alternative)
ARKESEL_API_KEY = config('ARKESEL_API_KEY', default='')
ARKESEL_SENDER_ID = config('ARKESEL_SENDER_ID', default='Movva')

# Twilio (international fallback)
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')

# Ghana-specific settings
DEFAULT_COUNTRY = 'Ghana'
DEFAULT_CURRENCY = 'GHS'
FUEL_PRICE_PER_LITER = config('FUEL_PRICE_PER_LITER', default=15.50, cast=float)
MOTORBIKE_FUEL_CONSUMPTION = config('MOTORBIKE_FUEL_CONSUMPTION', default=0.03, cast=float)  # liters per km
VAN_FUEL_CONSUMPTION = config('VAN_FUEL_CONSUMPTION', default=0.12, cast=float)  # liters per km

# Create upload directories
os.makedirs(POD_IMAGES_DIR, exist_ok=True)

# ============================================
# Email Configuration
# ============================================
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Movva <noreply@movva.app>')

# Pilot Program Settings
PILOT_NOTIFICATION_EMAIL = config('PILOT_NOTIFICATION_EMAIL', default='salimadams49@gmail.com')
PILOT_WHATSAPP_NUMBER = config('PILOT_WHATSAPP_NUMBER', default='+233557553975')

# ============================================
# Paystack Payment Gateway (Ghana)
# ============================================
PAYSTACK_PUBLIC_KEY = config('PAYSTACK_PUBLIC_KEY', default='')
PAYSTACK_SECRET_KEY = config('PAYSTACK_SECRET_KEY', default='')
PAYSTACK_CALLBACK_URL = config('PAYSTACK_CALLBACK_URL', default='https://movva-app.vercel.app/dashboard/billing/callback')

# Subscription Plans (Paystack Plan Codes)
PAYSTACK_STARTER_PLAN = config('PAYSTACK_STARTER_PLAN', default='')
PAYSTACK_PROFESSIONAL_PLAN = config('PAYSTACK_PROFESSIONAL_PLAN', default='')
PAYSTACK_ENTERPRISE_PLAN = config('PAYSTACK_ENTERPRISE_PLAN', default='')
