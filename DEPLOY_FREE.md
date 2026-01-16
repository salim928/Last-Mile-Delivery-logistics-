# Movva (Django) — Free Deployment Guide (Pilot-Ready)

This guide focuses on **$0 deployment options** you can use for pilots.

> Note: “Free tiers” on hosted platforms change often. Where a provider requires payment details or has limited credits, treat it as **free credits / trial** rather than guaranteed free forever.

## What you’re deploying

- **Backend (Django + DRF):** `files/backend`
- **Frontend (Next.js):** `files/frontend`
- **Docker Compose (both):** `files/docker-compose.yml`

---

## Option A (Recommended): One machine + a tunnel (truly free)

This is the most reliable “free” path: run the app on **one laptop/PC/VPS you already control**, and expose it to the internet via a tunnel.

### A1) Run the app with Docker Compose

From the repo root:

```bash
cd files
docker-compose up --build
```

Access locally:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Health: `http://localhost:8000/health/`

Create an admin user:

```bash
docker-compose exec backend python manage.py createsuperuser
```

### A2) Expose it publicly (pick one tunnel)

#### Cloudflare Tunnel (recommended)

1) Install `cloudflared` (Windows/macOS/Linux)
2) Authenticate once:

```bash
cloudflared tunnel login
```

3) Quick test (expose frontend only):

```bash
cloudflared tunnel --url http://localhost:3000
```

If you want to expose **both** frontend and backend, use an ingress config file and map paths, e.g.

- `/` → frontend (3000)
- `/api/` → backend (8000)

(Cloudflare’s tunnel ingress format is stable, but the exact CLI flags may differ by version—follow their output prompts.)

#### ngrok (simple)

```bash
ngrok http 3000
```

Then set the frontend env var to point at your backend URL (or expose backend on another ngrok tunnel).

### A3) Minimal pilot security settings

For a pilot that’s internet-exposed, set environment variables on the host (or in your platform dashboard):

- `DEBUG=False`
- `SECRET_KEY=<long-random-string>`
- `ALLOWED_HOSTS=<your-domain-or-tunnel-hostname>`
- `CORS_ALLOW_ALL_ORIGINS=False`
- `CORS_ALLOWED_ORIGINS=<your-frontend-origin>`

Also consider:

- Rotate `SECRET_KEY` before any real customer data
- Use HTTPS-only public URLs (tunnels typically provide HTTPS)

---

## Option B: Hosted platforms using free credits / low-cost plans

If you prefer not to run a machine yourself, these are the repo-supported paths.

### B1) Render Blueprint (uses `render.yaml`)

File: `files/render.yaml`

High-level steps:

1) Create a Render account
2) “Blueprint” deploy from your GitHub repo
3) Render reads `files/render.yaml` and provisions:
   - a Python web service (Django/gunicorn)
   - a Node web service (Next.js)
   - a Postgres database

Required environment variables are already outlined in `render.yaml`.

Important notes:

- If a “free plan” is no longer available, switch the plan and keep the same config.
- The backend health check is at `/health/` (see `files/backend/config/urls.py`).

### B2) Railway (uses `railway.toml`)

File: `files/backend/railway.toml`

High-level steps:

1) Create a Railway project from GitHub
2) Set root directory to `files/backend`
3) Add environment variables from `files/backend/.env.example`
4) Add a Postgres plugin and set `DATABASE_URL`

---

## Frontend-only “free hosting” (optional)

If your backend is tunneled/self-hosted, you can host the Next.js frontend on a typical free web hosting plan (if available) and set:

- `NEXT_PUBLIC_API_URL=https://<your-backend-host>/api/v1`

---

## Verification checklist (10 minutes)

- Open frontend and log in
- Upload a CSV order file and confirm validation
- Run route optimization and confirm routes appear
- Rider flow: open rider app and complete a POD (photo + OTP)
- Generate a COD reconciliation report
- Confirm health endpoint returns 200

---

## Troubleshooting

- If Postgres deployment fails on startup, ensure the backend has:
  - `psycopg2-binary` installed (Postgres driver)
  - `dj-database-url` installed (parses `DATABASE_URL`)
- If CORS fails (frontend can’t call backend):
  - set `CORS_ALLOW_ALL_ORIGINS=False`
  - set `CORS_ALLOWED_ORIGINS` to exactly your frontend origin
