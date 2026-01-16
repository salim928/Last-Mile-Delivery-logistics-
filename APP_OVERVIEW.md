# 🚚 Movva - Last-Mile Logistics Optimization Platform

## What is this App?

Movva is a **delivery route optimization and logistics management platform** built specifically for **Ghana's merchants**. It solves the critical problems faced by e-commerce merchants, pharmacies, supermarkets, and courier companies in managing their last-mile deliveries.

---

## Core Problem It Solves

1. **Inefficient Routes** → Riders waste time and fuel taking sub-optimal paths
2. **COD (Cash-on-Delivery) Losses** → Ghana's biggest pain point - money goes missing during cash collections
3. **Failed Deliveries** → No customer communication leads to failed attempts
4. **No Proof of Delivery** → Disputes arise without verification
5. **No Visibility** → Merchants can't track operations or measure performance

---

## How It Works (Technical Architecture)

### Three Main Components

| Component | Tech Stack | Purpose |
|-----------|------------|---------|
| **Backend API** | Django + DRF + OR-Tools | Route optimization, business logic |
| **Merchant Dashboard** | Next.js 15 + React 19 + TailwindCSS | Operations management |
| **Rider Mobile App** | Next.js PWA | Field operations for delivery riders |

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   MERCHANT      │     │    BACKEND       │     │   RIDER APP     │
│   DASHBOARD     │────▶│    API           │◀────│   (PWA)         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │                       ▼                        │
        │               ┌──────────────────┐             │
        │               │  OR-Tools VRP    │             │
        │               │  Route Optimizer │             │
        │               └──────────────────┘             │
        │                       │                        │
        ▼                       ▼                        ▼
   [Create Orders]      [Optimize Routes]      [Execute Deliveries]
   [Assign Riders]      [Calculate Savings]    [Capture POD]
   [View Reports]       [OSRM Distance API]    [Collect COD]
```

---

## Current Features (MVP - Phase 1) ✅

> Implementation note: the shipped backend is the Django project in `files/backend/` (apps live under `files/backend/apps/`).
> A legacy FastAPI prototype exists under `files/backend/app/` but is not the deployment target.

### 1. Order Management
**File:** `backend/app/routers/orders.py`

- CSV bulk upload (20-500 orders/day)
- Manual order entry
- Address geocoding via Nominatim
- Order status tracking (pending → assigned → in_transit → delivered/failed)

### 2. Route Optimization Engine
**File:** `backend/app/services/route_optimizer.py`

- **Google OR-Tools VRP solver** - solves the Vehicle Routing Problem
- Multi-stop route optimization
- OSRM integration for real driving distances
- Supports motorbike + van vehicle types
- Calculates: optimized distance, estimated time, stop sequence
- Compares optimized vs naive route to show savings

### 3. Dispatcher Dashboard
**File:** `frontend/src/app/dashboard/page.tsx`

- View all routes for the day
- Assign riders to routes
- Track delivery status in real-time
- Export routes to PDF/CSV

### 4. Proof of Delivery (POD)
**File:** `backend/app/routers/pod.py`

- Photo proof capture
- OTP confirmation (4-digit code sent to customer)
- GPS timestamp capture
- Offline capture with sync later

### 5. COD Reconciliation
**File:** `backend/app/services/cod_reconciliation.py`

- Expected vs collected cash tracking
- Daily COD summary reports
- Automatic mismatch flagging
- Per-rider COD accuracy tracking

### 6. Customer ETA Notifications
**File:** `backend/app/services/notifications.py`

- SMS/WhatsApp ETA alerts
- "Your rider is on the way" messages
- Reduces failed deliveries

### 7. ROI/Savings Reports
**File:** `backend/app/routers/reports.py`

- Distance saved (%)
- Time saved (%)
- Fuel cost saved (GHS)
- Success rate tracking
- PDF export for pitching to management

### 8. Rider Mobile App
**File:** `rider-app/src/app/page.tsx`

- PIN-based login
- Active route with stop sequence
- Navigation to each stop
- POD capture (photo + OTP)
- COD collection tracking
- Delivery history

### 9. Analytics Dashboard (NEW ✨)
**File:** `frontend/src/app/dashboard/analytics/page.tsx`

- **Visual KPI Charts** using Recharts library
- Delivery trends over time (area chart)
- Delivery status breakdown (pie chart)
- Route optimization impact (bar chart showing before/after)
- Daily cost savings (composed chart)
- Top riders leaderboard
- COD collection rate gauge
- Date range presets (7/30/90 days)
- Summary cards with key metrics

### 10. Customer Tracking Page (NEW ✨)
**File:** `frontend/src/app/track/[trackingId]/page.tsx`

- **Public URL** - no login required
- Real-time delivery status with visual timeline
- ETA countdown timer
- Live map placeholder showing rider location
- Rider profile with contact buttons (Call, WhatsApp)
- Package details including COD amount
- Delivery address display
- Mobile-responsive design
- Share button for tracking link

### 11. Rider Performance Dashboard (NEW ✨)
**File:** `frontend/src/app/dashboard/riders/performance/[id]/page.tsx`

- Overall performance score calculation
- Skills radar chart (Speed, Accuracy, Service, COD, Reliability, Navigation)
- Monthly trend charts (deliveries, earnings, rating)
- Daily performance bar chart (last 14 days)
- Hourly activity heatmap
- Achievement badges system
- Delivery success/failure breakdown
- Zone ranking display
- Key metrics: total deliveries, avg time, earnings, distance

### 12. Interactive Demo Mode (NEW ✨)
**File:** `frontend/src/app/demo/page.tsx`

- **50+ realistic Accra addresses** database
- Step-by-step demo walkthrough
- Auto-play with pause/resume controls
- Animated route optimization visualization
- Before/after comparison charts
- Simulated rider assignment
- Shows real savings metrics (distance, time, fuel, routes)
- CTA buttons to sign up
- Interactive map with delivery markers

---

## Future Plans (Roadmap)

### Phase 2: Product-Market Fit (Month 2-4)

| Feature | Purpose |
|---------|---------|
| **Traffic-Aware Routing** | Accra/Kumasi congestion patterns, peak-hour optimization |
| **Rider Analytics** | On-time rate, failed deliveries per rider, COD accuracy |
| **Enhanced Rider PWA** | Offline-first navigation, better UX |
| **Merchant Integrations** | Shopify, WooCommerce webhooks |
| **Multi-Branch Support** | Same merchant, multiple locations |

### Phase 3: VC-Fundable Scale (Month 4-12)

| Feature | Purpose |
|---------|---------|
| **AI Demand Forecasting** | Predict daily volume, recommend rider count |
| **Smart Fleet Optimization** | Bike vs van mix, fuel efficiency, maintenance alerts |
| **Cold-Chain Tracking** | Temperature sensors for pharmacy/food |
| **Automated MoMo Payments** | Rider settlement, COD digitization |
| **SLA & Enterprise Reports** | Service guarantees, chain-wide dashboards |

### Phase 4: Moat & Expansion (12-24 months)

| Feature | Purpose |
|---------|---------|
| **Embedded Finance** | Credit scoring from delivery data, working capital loans |
| **Carbon/Green Logistics** | Emissions tracking, EV routing, ESG reports |
| **Regional Expansion** | Nigeria, Côte d'Ivoire, Kenya |

---

## Technical Services Used (All Free)

| Service | Purpose | Limit |
|---------|---------|-------|
| **Nominatim** | Address geocoding | 1 req/sec |
| **OSRM** | Real driving distances | Unlimited |
| **OR-Tools** | Route optimization (VRP) | Unlimited |

---

## Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | GHS 199/mo | 500 orders, 5 riders, basic analytics |
| **Professional** | GHS 499/mo | 2,000 orders, unlimited riders, API access |
| **Enterprise** | Custom | Unlimited, dedicated support, SLA |

---

## Success Criteria (MVP)

- ✅ ≥3 pilot merchants  
- ✅ ≥1 paying customer  
- ✅ ≥10% delivery cost/time savings proven  
- ✅ Merchants asking for "next features"
- ✅ Visual analytics for investor demos
- ✅ Customer-facing tracking links
- ✅ Rider performance data
- ✅ Interactive demo mode

---

## Grant/Investor Ready Features ✨

The following features were specifically added to make the platform attractive to investors and grant programs:

| Feature | Impact | File |
|---------|--------|------|
| **Analytics Dashboard** | Visual proof of ROI with charts | `/dashboard/analytics` |
| **Customer Tracking** | Shows user-facing features | `/track/[id]` |
| **Rider Performance** | Demonstrates operational depth | `/dashboard/riders/performance/[id]` |
| **Interactive Demo** | Self-service pitch tool | `/demo` |
| **Ghana Address DB** | 50+ realistic Accra addresses | Demo page |
| **Before/After Charts** | Shows optimization impact | Analytics + Demo |

---

## Key Value Proposition

> *"We're not building an Uber clone. We're building logistics intelligence as infrastructure."*

The app proves ROI by showing merchants exactly how much money they save:

- **Distance saved** → Less fuel cost
- **Time saved** → More deliveries per day  
- **COD tracked** → No more missing cash
- **POD captured** → No more disputes

This is the **"sales weapon"** - a one-page PDF showing real savings that merchants can use to justify the subscription to their management.

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (optional)

### Option 1: Docker (Recommended)

```bash
# Clone and start
git clone <repo>
cd last-mile-optimizer
docker-compose up --build

# Access: 
# - Dashboard: http://localhost:3000
# - API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
files/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # App entry point
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   │   ├── merchant.py
│   │   │   ├── order.py
│   │   │   ├── rider.py
│   │   │   ├── route.py
│   │   │   └── pod.py
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── orders.py
│   │   │   ├── routes.py
│   │   │   ├── riders.py
│   │   │   ├── pod.py
│   │   │   └── reports.py
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   │       ├── route_optimizer.py
│   │       ├── geocoding.py
│   │       ├── notifications.py
│   │       ├── cod_reconciliation.py
│   │       └── reports.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # Next.js Merchant Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── demo/           # Interactive Demo (NEW ✨)
│   │   │   │   └── page.tsx
│   │   │   ├── track/          # Customer Tracking (NEW ✨)
│   │   │   │   └── [trackingId]/
│   │   │   │       └── page.tsx
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   │   ├── analytics/  # Analytics (NEW ✨)
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   ├── routes/
│   │   │   │   ├── riders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── performance/  # Rider Performance (NEW ✨)
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── cod/
│   │   │   │   └── reports/
│   │   │   └── (auth)/     # Login/Register
│   │   ├── components/
│   │   │   ├── ui/         # Reusable components
│   │   │   ├── maps/       # Map components
│   │   │   └── landing/    # Landing page
│   │   └── lib/
│   │       ├── api.ts      # API client
│   │       └── store.ts    # State management
│   ├── package.json
│   └── Dockerfile
│
├── rider-app/              # Rider PWA
│   └── src/app/page.tsx    # Main rider app
│
├── docker-compose.yml
├── README.md
├── SETUP.md
├── APP_OVERVIEW.md         # This file
└── spec.md                 # Full specification
```

---

## License

MIT
