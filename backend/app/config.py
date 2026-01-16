"""
Application configuration with environment variables. 
All services use free tiers or self-hosted options.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Last-Mile Optimizer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    
    # Database (SQLite for local, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./movva.db"
    
    # JWT Settings
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Free Geocoding Service (Nominatim - OpenStreetMap)
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org"
    NOMINATIM_USER_AGENT: str = "MovvaOptimizer/1.0"
    
    # Free Routing Service (OSRM - self-hosted or public demo)
    OSRM_URL: str = "http://router.project-osrm.org"
    
    # File Storage (local for MVP)
    UPLOAD_DIR: str = "./uploads"
    POD_IMAGES_DIR: str = "./uploads/pod"
    
    # SMS/WhatsApp (placeholder - use free tier services)
    SMS_ENABLED: bool = False
    TWILIO_ACCOUNT_SID:  Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER:  Optional[str] = None
    
    # Ghana-specific settings
    DEFAULT_COUNTRY: str = "Ghana"
    DEFAULT_CURRENCY: str = "GHS"
    FUEL_PRICE_PER_LITER: float = 15.50  # GHS
    MOTORBIKE_FUEL_CONSUMPTION:  float = 0.03  # liters per km
    VAN_FUEL_CONSUMPTION:  float = 0.12  # liters per km
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()