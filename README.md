# HostCheck

Track deep cleans and maintenance across your Branson properties.

---

## Setup Guide

### 1. Google OAuth — Create Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Fill in app name (e.g. "HostCheck"), your email
   - Add your Gmail as a **Test user** (under Test users section)
   - Save
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Name: HostCheck
   - Authorized redirect URIs — add:
     - `http://localhost:3001/auth/google/callback` (for local dev)
     - `https://your-backend.railway.app/auth/google/callback` (add after Railway deploy)
5. Copy the **Client ID** and **Client Secret**

---

### 2. Railway Setup

1. Go to [railway.app](https://railway.app) and create a new project
2. Click **Add Service → Database → PostgreSQL** — Railway provisions it automatically
3. Click **Add Service → Empty Service** — this is your **backend**
4. Click **Add Service → Empty Service** — this is your **frontend**
5. In the Postgres service, go to **Variables** and copy `DATABASE_URL`

---

### 3. Deploy the Backend

In the backend Railway service:

**Connect your repo:**
- Push this project to GitHub
- In Railway backend service → Settings → Source → connect your GitHub repo
- Set the **Root Directory** to `backend`
- Start command: `node index.js`

**Set environment variables** (Railway service → Variables):
```
DATABASE_URL        = (from Railway Postgres, auto-linked or paste it)
SESSION_SECRET      = (generate a random 32+ char string, e.g. use: openssl rand -base64 32)
GOOGLE_CLIENT_ID    = (from step 1)
GOOGLE_CLIENT_SECRET= (from step 1)
ALLOWED_EMAILS      = you@gmail.com
FRONTEND_URL        = https://your-frontend.railway.app  (set after frontend deploys)
BACKEND_URL         = https://your-backend.railway.app
NODE_ENV            = production
```

After deploy, Railway gives you a URL like `https://backend-production-xxxx.railway.app`.
Copy it — this is your `BACKEND_URL`.

Go back to Google Console and add:
`https://your-backend.railway.app/auth/google/callback`
to the authorized redirect URIs.

---

### 4. Deploy the Frontend

In the frontend Railway service:

- Root Directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

**Set environment variable:**
```
VITE_API_URL = https://your-backend.railway.app
```

After deploy, you'll get a frontend URL. Copy it and:
- Set `FRONTEND_URL` in your backend Railway service variables to this URL
- Redeploy the backend

---

### 5. Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

**Frontend (separate terminal):**
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

Open http://localhost:5173

---

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Railway managed)
- **Auth:** Google OAuth 2.0 via Passport.js
- **Sessions:** Stored in Postgres
