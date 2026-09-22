# NEXUS-LAND Deployment Guide

Deploy the **backend on Render** and **frontend on Vercel** in ~15 minutes.

---

## Prerequisites

- GitHub repository with the project pushed
- [Render](https://render.com) account (free tier works)
- [Vercel](https://vercel.com) account (free tier works)

---

## Step 1 — Deploy Backend on Render

### 1.1 Create a Web Service

1. Go to **Render Dashboard → New → Web Service**
2. Connect your GitHub repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `nexus-land-api` (or any name) |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `python start-server.py` |
   | **Instance Type** | Free (or Starter for always-on) |

### 1.2 Add a PostgreSQL Database (Optional but Recommended)

1. In Render Dashboard: **New → PostgreSQL**
2. After it's created, copy the **Internal Database URL**
3. Add it as `DATABASE_URL` in the backend service environment variables

> **Note:** Without PostgreSQL, the app will use SQLite (data resets on each deploy). This is fine for demos.

### 1.3 Set Environment Variables in Render

Go to your web service → **Environment** tab and add:

| Variable | Value | Required |
|----------|-------|----------|
| `SECRET_KEY` | Any 32+ char random string | ✅ |
| `BACKEND_URL` | `https://your-service-name.onrender.com` | ✅ |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ |
| `DATABASE_URL` | PostgreSQL URL from step 1.2 | Optional |
| `GROQ_API_KEY` | Your Groq API key (for AI Copilot) | Optional |

Generate a `SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 1.4 Deploy

Click **Deploy** → wait ~3-5 minutes for the first build.

**Health check URL:** `https://your-service-name.onrender.com/health`

> ⚠️ **Free tier caveat:** Render free services spin down after 15 min of inactivity and take ~30s to wake up on first request. Upgrade to Starter (\$7/mo) for always-on.

---

## Step 2 — Deploy Frontend on Vercel

### 2.1 Import Project

1. Go to **Vercel Dashboard → Add New → Project**
2. Import your GitHub repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

### 2.2 Set Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-service-name.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID (or leave as `mock-client-id` for dev bypass) |

> **Important:** `VITE_API_URL` must point to your Render backend URL + `/api`

### 2.3 Deploy

Click **Deploy** → Vercel builds and deploys in ~1-2 minutes.

Your app will be live at: `https://your-project.vercel.app`

---

## Step 3 — Post-Deployment Verification

### Backend health check
```bash
curl https://your-service-name.onrender.com/health
# Expected: {"status":"HEALTHY","service":"NEXUS-LAND Intelligence Platform"}
```

### Login with dev bypass (no Google OAuth needed)
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexusland.gov","password":"Admin2024!"}'
```

### Test API endpoint
```bash
curl https://your-service-name.onrender.com/api/hazards/stats
```

---

## Environment Variable Reference

### Backend (Render)

```env
# Required
SECRET_KEY=<generate with: python3 -c "import secrets; print(secrets.token_hex(32))">
BACKEND_URL=https://your-service-name.onrender.com
FRONTEND_URL=https://your-app.vercel.app

# Optional but recommended
DATABASE_URL=postgresql://user:pass@host/dbname
GROQ_API_KEY=gsk_...
PORT=8000
RELOAD=false
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-service-name.onrender.com/api
VITE_GOOGLE_CLIENT_ID=mock-client-id
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@nexusland.gov` | `Admin2024!` |
| Dev bypass token | — | `dev_mock_google_token` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS errors in browser | Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly |
| 404 on page refresh | `vercel.json` rewrites handle this — ensure it's in `frontend/` |
| Backend won't start | Check Render logs; ensure `SECRET_KEY` is set |
| PostgreSQL connection error | Render provides `postgresql://` URLs — the app normalizes these automatically |
| AI Copilot not responding | Set `GROQ_API_KEY` in Render env vars; falls back gracefully without it |
| Flood images not loading | The `Flood Area Segmentation/` folder (109MB) must be committed to the repo or served from object storage |

---

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Vercel (Frontend) │ ──API──▶│  Render (Backend)        │
│   React + Vite      │         │  FastAPI + SQLAlchemy    │
│   https://...vercel │◀──CORS──│  PostgreSQL / SQLite     │
└─────────────────────┘         └──────────────────────────┘
                                          │
                              ┌───────────┼──────────────┐
                              │           │              │
                         Open-Meteo    USGS          GDACS
                         (weather)  (earthquakes) (multi-hazard)
```
