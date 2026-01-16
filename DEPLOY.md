# ===========================================
# Last-Mile Optimizer - Deployment Guide
# ===========================================

## Quick Start (Local Development)

### Backend (Django)
```bash
cd files/backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend (Next.js)
```bash
cd files/frontend
npm install
npm run dev
```

---

## Production Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up** at https://railway.app (free tier available)

2. **Deploy Backend:**
   - New Project → Deploy from GitHub Repo
   - Select `files/backend` as root directory
   - Add environment variables:
     ```
     SECRET_KEY=<generate-a-long-random-string>
     DEBUG=False
     ALLOWED_HOSTS=*.railway.app
     DATABASE_URL=<auto-provided-by-railway-postgres>
     SMS_ENABLED=True
     HUBTEL_CLIENT_ID=<your-hubtel-id>
     HUBTEL_CLIENT_SECRET=<your-hubtel-secret>
     ```
   - Railway auto-detects `railway.toml`

3. **Deploy Frontend:**
   - Add another service from same repo
   - Select `files/frontend` as root directory
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
     ```

4. **Add PostgreSQL:**
   - New → Database → PostgreSQL
   - Link to backend service

---

### Option 2: Render

1. **Sign up** at https://render.com

2. **Deploy via Blueprint:**
   - New → Blueprint
   - Connect GitHub repo
   - Render reads `render.yaml` automatically

3. **Manual Setup:**
   - Create Web Service for backend
   - Create Static Site for frontend
   - Create PostgreSQL database
   - Configure environment variables

---

### Option 3: Docker Compose (VPS/Self-hosted)

```bash
cd files

# Build and run
docker-compose up -d

# With PostgreSQL (create docker-compose.prod.yml):
docker-compose -f docker-compose.prod.yml up -d
```

For production, add to `docker-compose.prod.yml`:
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: movva
      POSTGRES_USER: movva
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    environment:
      DATABASE_URL: postgres://movva:secure_password@db:5432/movva
    depends_on:
      - db
```

---

## SMS Provider Setup (Ghana)

### Hubtel (Recommended)
1. Sign up at https://developers.hubtel.com/
2. Create an application
3. Get Client ID and Client Secret
4. Set environment variables:
   ```
   SMS_ENABLED=True
   HUBTEL_CLIENT_ID=your_client_id
   HUBTEL_CLIENT_SECRET=your_secret
   HUBTEL_SENDER_ID=Movva  # or your business name
   ```

### Arkesel (Alternative)
1. Sign up at https://arkesel.com/
2. Get API key
3. Set environment variables:
   ```
   SMS_ENABLED=True
   ARKESEL_API_KEY=your_api_key
   ARKESEL_SENDER_ID=Movva
   ```

---

## Domain & SSL

### Railway
- Auto-provides SSL
- Custom domain in settings

### Render
- Auto-provides SSL
- Custom domain in service settings

### Self-hosted
- Use Caddy or nginx with Let's Encrypt
- Example Caddy:
  ```
  api.yourdomain.com {
      reverse_proxy backend:8000
  }
  
  app.yourdomain.com {
      reverse_proxy frontend:3000
  }
  ```

---

## Post-Deployment Checklist

- [ ] Create admin/superuser: `python manage.py createsuperuser`
- [ ] Test health endpoint: `https://<your-host>/health/`
- [ ] Test merchant registration
- [ ] Test rider login
- [ ] Test order creation + route optimization
- [ ] Test delivery completion with photo
- [ ] Verify SMS is working (check Hubtel dashboard)
- [ ] Download a savings report PDF
- [ ] Set up monitoring (Railway/Render has built-in)

---

## Support

For pilot deployments in Ghana, contact:
- Technical: [your email]
- Sales: [your email]
