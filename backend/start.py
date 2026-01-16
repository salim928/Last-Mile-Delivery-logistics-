#!/usr/bin/env python
"""Startup script for Render deployment"""
import os
import subprocess
import sys

def main():
    """Run migrations and start server"""
    print("Running database migrations...")
    subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)
    
    print("Starting Gunicorn server...")
    port = os.environ.get("PORT", "10000")
    subprocess.run([
        "gunicorn",
        "config.wsgi:application",
        "--bind", f"0.0.0.0:{port}",
        "--workers", "2"
    ], check=True)

if __name__ == "__main__":
    main()
