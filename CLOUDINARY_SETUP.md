# Cloudinary Setup (File Storage)

Your backend now supports **Cloudinary** for file storage. When Cloudinary env vars are set, uploads go to Cloudinary instead of local disk or R2.

---

## 1. Get your Cloud Name

In [Cloudinary Dashboard](https://console.cloudinary.com):

- Open **Dashboard** (home).
- At the top you’ll see **Cloud name**, **API Key**, **API Secret** (click “Reveal” for secret).

You need all three from the dashboard:
- **Cloud name** (e.g. `dxxxxxxxx`)
- **API Key**
- **API Secret** (click “Reveal” to see it)

---

## 2. Environment variables

Use **either** the three separate variables **or** the single URL.

**Option A – Separate variables (recommended)**

| Variable | Value |
|----------|--------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name (e.g. `dqabgjv3y`) |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

**Option B – Single URL**

```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Example: `CLOUDINARY_URL=cloudinary://567844647542757:YOUR_SECRET@dqabgjv3y`

Your `flask-backend/.env` is already set with the three variables for local development.

If these are set, the app uses Cloudinary and ignores R2 and local storage.

---

## 3. Local run

```bash
cd flask-backend
pip install -r requirements.txt
# Add the 3 CLOUDINARY_* vars to .env
python main.py
```

Upload a file from the frontend; it should appear under **Media Library** in the Cloudinary console (filter by “Raw” if needed).

---

## 4. Deploy (e.g. Render)

In your Render **Web Service** → **Environment**:

1. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Save (Render will redeploy).

No `LOCAL_STORAGE_PATH` or R2 vars are required when using Cloudinary.

---

## 5. Free tier

- Free plan includes storage and bandwidth limits.
- Raw files (PDFs, etc.) count like other assets.
- Check [Cloudinary pricing](https://cloudinary.com/pricing) for your plan’s limits.

---

## 6. Security

- **Do not** put API secret in frontend or in public repos.
- Keep `.env` in `.gitignore` and only set these in server-side environment (e.g. Render env vars).

---

## 7. "Customer is marked as untrusted" / `show_original_customer_untrusted`

If you see:

```json
{ "error": { "message": "Customer is marked as untrusted", "code": "show_original_customer_untrusted" } }
```

when **uploading** or when **opening/viewing** files in the Cloudinary console, this is an **account-level restriction** from Cloudinary, not a bug in your code.

**What to do:**

1. **Dashboard** – In [Cloudinary Console](https://console.cloudinary.com), check **Settings** (e.g. Security, Account) for any “untrusted” or restriction flags.
2. **New / free accounts** – New or free-tier accounts can be flagged for review. Wait 24–48 hours or complete any verification Cloudinary requested.
3. **Support** – Contact [Cloudinary support](https://support.cloudinary.com) and mention the error code `show_original_customer_untrusted`. They can confirm why the account is restricted and how to get it cleared.
4. **Temporary workaround** – Use **local storage** or **R2** instead of Cloudinary until the account is in good standing: set `LOCAL_STORAGE_PATH` or the R2 env vars and leave Cloudinary vars unset so the app does not use Cloudinary.
