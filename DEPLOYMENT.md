# LeafSense AI Deployment Guide

This guide details how to deploy your LeafSense AI backend and frontend for production/hackathons.

## Backend Deployment (Render / Docker)

### Option 1: Render (Easiest)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Auto-connect your GitHub repository.
4. Set the Environment: **Docker**.
5. Set Environment Variables in Render:
   - `GEMINI_API_KEY`: `your_key`
   - `MODEL_PATH`: `models/plant_disease_model.h5`
6. Click Deploy. Render will automatically build via the `Dockerfile`.

### Option 2: Custom VPS (Docker Compose / Native)
1. Install Docker on your server.
2. Build the image: `docker build -t leafsense-backend .`
3. Run the container: `docker run -d -p 8000:8000 --env-file .env leafsense-backend`

> **Note on Memory**: The Dockerfile uses `python:3.10-slim` and `tensorflow-cpu` to reduce image size and prevent out-of-memory errors on cheap VPS/Render free tiers. It executes via `gunicorn` with a `uvicorn` worker for handling asynchronous requests safely.

---

## Frontend Deployment (Vercel)

Vercel is the native host for Next.js. 

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend` if your Next.js app is inside a subfolder, otherwise leave as root.
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-render-backend-url.onrender.com` (Do NOT include a trailing slash)
6. Click **Deploy**.

## Updating CORS Config
Once your Vercel frontend is deployed, copy its URL. Go into your Backend's `app/main.py` and update the CORS rule to securely lock it down:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # <-- Change this!
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
```
Commit and push to redeploy the backend securely.
