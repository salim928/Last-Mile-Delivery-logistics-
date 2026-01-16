# Last-Mile Logistics Optimizer - Setup Instructions

## Quick Start with Docker Compose

1. **Copy environment files:**
   ```bash
   cp files/backend/.env.example files/backend/.env
   cp files/frontend/.env.example files/frontend/.env
   ```

2. **Start the application:**
   ```bash
   cd files
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend Dashboard: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Base: http://localhost:8000/api/v1
   - Health: http://localhost:8000/health/

## Manual Setup (Without Docker)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd files/backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the backend:
   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd files/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

## Default Credentials

After first run, create an admin user via API:
- POST to http://localhost:8000/api/v1/auth/register
- Or use the registration page at http://localhost:3000/register

## Features

- ✅ Order management
- ✅ Route optimization using OR-Tools
- ✅ Real-time delivery tracking
- ✅ COD reconciliation
- ✅ Proof of delivery with image upload
- ✅ Analytics and reporting
- ✅ Free tier services (OpenStreetMap, OSRM)

## Troubleshooting

**Frontend build fails:**
- Ensure Node.js version 18+ is installed
- Delete `node_modules` and run `npm install` again

**Backend startup errors:**
- Check Python version (3.11+ required)
- Verify all dependencies are installed
- Check DATABASE_URL in .env file

**Docker issues:**
- Ensure Docker and Docker Compose are installed
- Check ports 3000 and 8000 are not in use
- Try `docker-compose down -v` to reset volumes
