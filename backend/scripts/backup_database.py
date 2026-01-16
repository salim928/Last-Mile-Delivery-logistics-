#!/usr/bin/env python
"""
Automated PostgreSQL database backup script
Run this daily via cron job or scheduled task
"""
import os
import boto3
from datetime import datetime, timedelta
from pathlib import Path
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL')
BACKUP_DIR = os.getenv('BACKUP_DIR', './backups')
BACKUP_RETENTION_DAYS = int(os.getenv('BACKUP_RETENTION_DAYS', 7))
S3_BUCKET = os.getenv('BACKUP_S3_BUCKET')  # Optional: upload to S3
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')


def create_backup():
    """Create PostgreSQL backup using pg_dump"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = Path(BACKUP_DIR) / f'movva_backup_{timestamp}.sql'
    
    # Create backup directory if it doesn't exist
    Path(BACKUP_DIR).mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Creating backup: {backup_file}")
    
    try:
        # Use pg_dump to create backup
        cmd = f'pg_dump {DATABASE_URL} > {backup_file}'
        subprocess.run(cmd, shell=True, check=True)
        
        logger.info(f"Backup created successfully: {backup_file}")
        return backup_file
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Backup failed: {e}")
        return None


def compress_backup(backup_file: Path):
    """Compress backup file using gzip"""
    compressed_file = Path(str(backup_file) + '.gz')
    
    logger.info(f"Compressing backup: {compressed_file}")
    
    try:
        cmd = f'gzip {backup_file}'
        subprocess.run(cmd, shell=True, check=True)
        
        logger.info(f"Backup compressed: {compressed_file}")
        return compressed_file
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Compression failed: {e}")
        return backup_file


def upload_to_s3(file_path: Path):
    """Upload backup to S3 (optional)"""
    if not S3_BUCKET or not AWS_ACCESS_KEY:
        logger.info("S3 upload skipped (not configured)")
        return
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY
        )
        
        s3_key = f'backups/{file_path.name}'
        logger.info(f"Uploading to S3: s3://{S3_BUCKET}/{s3_key}")
        
        s3_client.upload_file(
            str(file_path),
            S3_BUCKET,
            s3_key
        )
        
        logger.info("S3 upload successful")
    
    except Exception as e:
        logger.error(f"S3 upload failed: {e}")


def cleanup_old_backups():
    """Remove backups older than retention period"""
    cutoff_date = datetime.now() - timedelta(days=BACKUP_RETENTION_DAYS)
    backup_dir = Path(BACKUP_DIR)
    
    if not backup_dir.exists():
        return
    
    deleted_count = 0
    for backup_file in backup_dir.glob('movva_backup_*.sql*'):
        # Extract timestamp from filename
        try:
            timestamp_str = backup_file.stem.split('_')[-2] + backup_file.stem.split('_')[-1]
            file_date = datetime.strptime(timestamp_str, '%Y%m%d%H%M%S')
            
            if file_date < cutoff_date:
                backup_file.unlink()
                deleted_count += 1
                logger.info(f"Deleted old backup: {backup_file}")
        
        except (ValueError, IndexError):
            logger.warning(f"Could not parse date from: {backup_file}")
    
    if deleted_count > 0:
        logger.info(f"Cleaned up {deleted_count} old backups")


def main():
    """Main backup routine"""
    logger.info("=== Starting database backup ===")
    
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set!")
        return 1
    
    # Create backup
    backup_file = create_backup()
    if not backup_file:
        return 1
    
    # Compress backup
    compressed_file = compress_backup(backup_file)
    
    # Upload to S3 (optional)
    upload_to_s3(compressed_file)
    
    # Cleanup old backups
    cleanup_old_backups()
    
    logger.info("=== Backup completed successfully ===")
    return 0


if __name__ == '__main__':
    exit(main())
