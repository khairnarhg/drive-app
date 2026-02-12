# Cloudflare R2 Setup Guide (Easiest File Storage)

## Why R2?
- **Free tier:** 10GB storage, unlimited egress (no download fees)
- **S3-compatible:** Works with boto3 (already added to requirements.txt)
- **No credit card required** for free tier
- **Persistent:** Files survive deploys/restarts (unlike Render's ephemeral disk)

---

## Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Sign up/login
2. Navigate to **R2** (in left sidebar)
3. Click **Create bucket**
4. Name: `drive-app-uploads` (or any name you like)
5. **Location:** Choose closest to your users (e.g., `us-east-1`)
6. Click **Create bucket**

---

## Step 2: Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens** (top right)
2. Click **Create API token**
3. **Permissions:** Select **Object Read & Write**
4. **TTL:** Leave blank (no expiration) or set a date
5. Click **Create API Token**
6. **IMPORTANT:** Copy these values immediately (you won't see them again):
   - **Access Key ID** (e.g., `abc123...`)
   - **Secret Access Key** (e.g., `xyz789...`)

---

## Step 3: Get Your Endpoint URL

1. In R2 dashboard, click on your bucket name
2. Go to **Settings** tab
3. Find **S3 API** section
4. Copy the **Endpoint** URL (e.g., `https://<account-id>.r2.cloudflarestorage.com`)

   **Note:** Your account ID is in the URL. Format: `https://<account-id>.r2.cloudflarestorage.com`

---

## Step 4: Add Environment Variables to Render

1. Go to your **Render Web Service** dashboard
2. Click on your service → **Environment** tab
3. Add these 4 variables:

   | Key | Value | Example |
   |-----|-------|---------|
   | `R2_ENDPOINT_URL` | Your R2 endpoint | `https://abc123def456.r2.cloudflarestorage.com` |
   | `R2_ACCESS_KEY_ID` | Access Key ID from Step 2 | `abc123...` |
   | `R2_SECRET_ACCESS_KEY` | Secret Access Key from Step 2 | `xyz789...` |
   | `R2_BUCKET_NAME` | Your bucket name | `drive-app-uploads` |

4. **Remove or leave empty** `LOCAL_STORAGE_PATH` (R2 takes priority if all R2 vars are set)

5. Click **Save Changes** → Render will redeploy automatically

---

## Step 5: Test

1. After redeploy, test uploading a file from your frontend
2. Check R2 dashboard → Your bucket → **Objects** tab
3. You should see uploaded files listed there!

---

## How It Works

- **Upload:** Files go directly to R2 bucket
- **Download:** Backend generates a presigned URL (valid 1 hour) and redirects user
- **Delete:** Backend deletes from R2 bucket

---

## Troubleshooting

**Error: "Either R2 config or LOCAL_STORAGE_PATH must be set"**
- Make sure all 4 R2 env vars are set in Render
- Check for typos in variable names

**Error: "Access Denied" or "403"**
- Verify your Access Key ID and Secret Access Key are correct
- Check bucket name matches exactly

**Files not appearing in R2**
- Check Render logs for errors
- Verify bucket name in env var matches the actual bucket name

---

## Cost

- **Free tier:** 10GB storage, unlimited egress
- **After free tier:** $0.015/GB/month storage, still no egress fees
- **Much cheaper than AWS S3** (which charges for downloads)

---

## Optional: Public Access

If you want public file URLs (not recommended for private files), you can:
1. R2 bucket → **Settings** → **Public Access**
2. Enable public access
3. Files will be accessible at: `https://pub-<account-id>.r2.dev/<file-key>`

But for your drive app, **presigned URLs** (current implementation) are better for security.
