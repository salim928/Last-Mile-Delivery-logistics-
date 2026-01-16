#!/bin/bash
# Startup script for Render free tier

# Run migrations
python manage.py migrate --noinput

# Start Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
