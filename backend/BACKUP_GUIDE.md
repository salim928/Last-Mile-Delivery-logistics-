# Database Backup Guide

## Setup Instructions

### 1. Manual Backups

Run the backup script manually:
```bash
python scripts/backup_database.py
```

### 2. Automated Backups (Render)

Render doesn't support cron jobs on free tier, but you can use:

#### Option A: GitHub Actions (Recommended)
Create `.github/workflows/backup.yml`:

```yaml
name: Daily Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Run at 2 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install boto3
      
      - name: Run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BACKUP_S3_BUCKET: ${{ secrets.BACKUP_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: python backend/scripts/backup_database.py
```

#### Option B: External Cron Service
Use services like:
- **EasyCron** (free tier: 1 cron job)
- **cron-job.org** (free tier: 3 cron jobs)

Configure to hit a backup endpoint:
```
https://movva-backend.onrender.com/api/v1/admin/backup
```

### 3. Environment Variables

Add to Render:
```bash
BACKUP_DIR=/tmp/backups  # Render filesystem
BACKUP_RETENTION_DAYS=7
BACKUP_S3_BUCKET=movva-backups  # Optional
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### 4. S3 Setup (Optional but Recommended)

1. Create AWS S3 bucket: `movva-backups`
2. Set lifecycle policy to delete files after 30 days
3. Add IAM user with S3 write permissions
4. Add credentials to environment variables

## Backup Verification

Test backup restoration:
```bash
# Decompress
gunzip movva_backup_20260116_140000.sql.gz

# Restore to test database
psql test_database < movva_backup_20260116_140000.sql
```

## Render PostgreSQL Native Backups

Render PostgreSQL includes:
- **Automatic daily backups** (last 7 days on free tier)
- **Point-in-time recovery** (paid plans)

Access via Render dashboard → PostgreSQL → Backups tab

## Monitoring

Set up alerts for backup failures:
- Add to GitHub Actions secrets
- Use Sentry for error notifications
- Set up email alerts on cron job failures
