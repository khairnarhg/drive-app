# Deploy Drive App (free tier)

Recommended free stack:

- **Frontend:** Vercel (Next.js)
- **Backend:** Render (Flask)
- **Database:** Render PostgreSQL or Neon
- **File storage:** See “File storage” below (local disk vs Cloudflare R2)

---

## 1. Prepare the repo

- Push your code to **GitHub** (or GitLab).
- Ensure `flask-backend/` and `client/` are in the same repo (monorepo).

---

## 2. Database (PostgreSQL)

### Option A: Render PostgreSQL (easiest with Render backend)

1. Go to [render.com](https://render.com) → Sign up (GitHub).
2. **Dashboard** → **New** → **PostgreSQL**.
3. Name: `drive-db`. Region: pick one close to you.
4. Create. Wait until **Available**.
5. Open the DB → **Info** tab. Copy **Internal Database URL** (use this for the backend on Render).  
   If you need to connect from your PC (e.g. run migrations), use **External Database URL** and add your IP in **Connections** if required.

### Option B: Neon (free, no card)

1. Go to [neon.tech](https://neon.tech) → Sign up.
2. Create a project and a database.
3. Copy the connection string (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

---

## 3. Backend (Flask) on Render

1. **Render Dashboard** → **New** → **Web Service**.
2. Connect your GitHub repo. Choose the repo that contains `flask-backend`.
3. **Root Directory:** set to `flask-backend` (if the repo root is the monorepo).
4. **Runtime:** Python 3.
5. **Build command:**
   ```bash
   pip install -r requirements.txt
   ```
6. **Start command:**
   ```bash
   gunicorn -w 1 -b 0.0.0.0:$PORT main:app
   ```
   (Render sets `PORT`.)

7. **Environment variables** (Render → your service → **Environment**):

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Your PostgreSQL URL (from step 2; use Internal URL if same Render account). |
   | `LOCAL_STORAGE_PATH` | `/tmp/uploads` (see “File storage” below). |
   | `JWT_SECRET_KEY` | A long random string (e.g. from `openssl rand -hex 32`). |
   | `JWT_ACCESS_TOKEN_EXPIRES` | `86400` (seconds). |
   | `PYTHON_VERSION` | `3.12` (optional, match your app). |

8. **Save** → Deploy. After deploy, note the service URL (e.g. `https://your-app.onrender.com`).

9. **Run migrations** (one-time):
   - Either: **Shell** in Render (open your web service → **Shell** tab):
     ```bash
     flask db upgrade
     ```
     (Set `FLASK_APP=main.py` in Environment if needed.)
   - Or: from your machine using the **external** DB URL:
     ```bash
     cd flask-backend
     export DATABASE_URL="<external-postgres-url>"
     export FLASK_APP=main.py
     flask db upgrade
     ```

---

## 4. Frontend (Next.js) on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub.
2. **Add New** → **Project** → Import the same repo.
3. **Root Directory:** set to `client` (if monorepo).
4. **Framework:** Next.js (auto-detected).
5. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | Your backend URL, e.g. `https://your-app.onrender.com` (no trailing slash). |

6. Deploy. Vercel will give you a URL like `https://your-project.vercel.app`.

---

## 5. CORS (backend)

Your Flask app already uses `flask-cors`. For production, restrict origins:

In `flask-backend/app/__init__.py` (or where you create the app), you can set:

```python
CORS(app, origins=[
    "https://your-project.vercel.app",
    "http://localhost:3000"
])
```

Or keep `CORS(app)` for simplicity while testing; tighten later.

---

## 6. File storage on free hosting

### Important: local disk on Render/Railway/etc.

On Render (and most free PaaS), the filesystem is **ephemeral**:

- Files written to `/tmp` or any path on the server are **deleted on deploy or restart**.
- So with `LOCAL_STORAGE_PATH=/tmp/uploads`, uploads **will not persist** across deploys.

Use this only for trying out deployment. For real use you need persistent storage.

### Option A: Local path (testing only)

- **Render:** set `LOCAL_STORAGE_PATH=/tmp/uploads`.
- Accept that uploads are lost on redeploy/restart.

### Option B: Persistent storage with Cloudflare R2 (recommended)

R2 is S3-compatible and has a generous free tier (e.g. 10 GB storage, no egress fees).

1. **Create R2 bucket**
   - [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → Create bucket (e.g. `drive-app-uploads`).

2. **API token**
   - R2 → **Manage R2 API Tokens** → Create token with “Object Read & Write”.
   - Note: **Access Key ID**, **Secret Access Key**, and **Bucket** name.
   - In R2 bucket → **Settings** → note **Endpoint** (e.g. `https://<account_id>.r2.cloudflarestorage.com`).

3. **Backend changes**
   - Your app currently uses only local disk (`LocalStorageService`). To use R2 you need an S3-compatible layer (e.g. `boto3`) and a small abstraction so upload/download/delete use R2 instead of the local path.
   - Env vars you’d add for R2:
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_BUCKET_NAME`
     - `R2_PUBLIC_URL` (if you serve downloads via a public URL; optional).
   - Then set `LOCAL_STORAGE_PATH` only when not using R2, or introduce something like `STORAGE_BACKEND=r2` and keep local as fallback.

4. **Configure on Render**
   - Add the R2 env vars above to your Render Web Service.
   - After you implement the R2 backend, deploy again; uploads will persist in R2.

If you want, the next step is to add a small “storage backend” in the Flask app (local vs R2) and wire upload/download/delete to it so you only configure storage via env vars.

---

## 7. Checklist

- [ ] Repo on GitHub.
- [ ] PostgreSQL created (Render or Neon); URL copied.
- [ ] Render Web Service: `flask-backend`, env vars set, `gunicorn` start command, `LOCAL_STORAGE_PATH=/tmp/uploads` (or R2 when implemented).
- [ ] Migrations run (`flask db upgrade`).
- [ ] Vercel project: root `client`, `NEXT_PUBLIC_API_URL` = Render backend URL.
- [ ] CORS allows your Vercel (and localhost if needed).
- [ ] Test: sign up, login, upload (remember: local disk = not persistent until you add R2 or another store).

---

## 8. Optional: Run backend locally against hosted DB

To point your local Flask at the deployed DB (e.g. to run migrations or debug):

```bash
cd flask-backend
export DATABASE_URL="<external-postgres-url>"
export LOCAL_STORAGE_PATH="./uploads"
export JWT_SECRET_KEY="your-secret"
python main.py
```

Use the **external** database URL and ensure your IP is allowed if the provider has a firewall.

---

## Summary

| Component   | Where        | Notes                                      |
|------------|--------------|--------------------------------------------|
| Frontend   | Vercel       | Set `NEXT_PUBLIC_API_URL` to backend URL.  |
| Backend    | Render       | Set `DATABASE_URL`, `JWT_SECRET_KEY`, `LOCAL_STORAGE_PATH`. |
| Database   | Render / Neon| Use internal URL for backend on same host. |
| File store | `/tmp/uploads` or R2 | Local = ephemeral; R2 = persistent (needs code change). |
