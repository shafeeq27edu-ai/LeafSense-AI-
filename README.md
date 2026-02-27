# 🌿 LeafSense AI — Multilingual Agricultural Decision Support System

> AI-powered multilingual agricultural decision support system for smallholder farmers in India.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://leaf-sense-ai.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-blueviolet?style=flat-square&logo=render)](https://leafsense-ai.onrender.com/health)
[![Python](https://img.shields.io/badge/Python-3.10-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)

---

## 🎯 Problem Statement

Smallholder farmers in India lose an estimated **₹50,000 crore annually** to undetected crop diseases. Existing diagnostic tools are inaccessible: expensive, English-only, and require internet speeds unavailable in rural areas. LeafSense AI solves this with an offline-capable, multilingual plant disease detection system that delivers expert-level agricultural advice in seconds.

---

## 🧠 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         LeafSense AI — System Flow                     │
├──────────────┬─────────────────────────────┬───────────────────────────┤
│  LAYER 1     │  LAYER 2                    │  LAYER 3                  │
│  VALIDATION  │  INFERENCE                  │  DECISION ENGINE          │
│              │                             │                           │
│  ┌─────────┐ │  ┌──────────────────────┐   │  ┌─────────────────────┐  │
│  │  Blur   │ │  │  MobileNetV2         │   │  │  Tier Assignment    │  │
│  │  Check  │►│  │  Transfer Learning   │►  │  │  (High / Probable / │  │
│  │  (FFT)  │ │  │  PlantVillage 38     │   │  │   Uncertain)        │  │
│  └─────────┘ │  │  classes             │   │  └──────────┬──────────┘  │
│              │  └──────────────────────┘   │           │               │
│  ┌─────────┐ │                             │  ┌──────────▼──────────┐  │
│  │  OOD    │ │  ┌──────────────────────┐   │  │  Risk Score Engine  │  │
│  │Validator│ │  │  CLAHE + Adaptive    │   │  │  (confidence × 0.6  │  │
│  │ HSV +   │►│  │  Sharpening +        │   │  │  + severity × 0.1   │  │
│  │Entropy+ │ │  │  TTA Augmentation    │   │  │  + lesion × 0.2)    │  │
│  │  Edge   │ │  └──────────────────────┘   │  └──────────┬──────────┘  │
│  └─────────┘ │                             │              │            │
│              │  ┌──────────────────────┐   │  ┌──────────▼──────────┐  │
│              │  │  Temperature Scaling │   │  │  Gemini 1.5 Flash   │  │
│              │  │  (Confidence Calib.) │   │  │  Structured JSON    │  │
│              │  └──────────────────────┘   │  │   Output (8 langs)  │  │
│              │                             │  └──────────┬──────────┘  │
│              │                             │           │               │
│              │                             │  ┌──────────▼──────────┐  │
│              │                             │  │  Gov. Scheme Gate   │  │
│              │                             │  │  + Weather Context  │  │
│              │                             │  └─────────────────────┘  │
└──────────────┴─────────────────────────────┴───────────────────────────┘
```

---

## ✅ Core Features

### 🔬 ML Inference Engine
- **MobileNetV2 Transfer Learning** trained on PlantVillage dataset (38 disease classes, 14 crops)
- **OpenCV Preprocessing** using CLAHE + adaptive sharpening, aligned with `tf.keras.applications.mobilenet_v2.preprocess_input` (`[-1, 1]` normalization)
- **Test-Time Augmentation (TTA)** — averages 4 augmented inference passes for robustness
- **Temperature Scaling** (T=1.5) for calibrated confidence outputs — reduces overconfidence
- **Top-K Confidence Scores** returned with every prediction

### 🛡️ Out-of-Distribution (OOD) Validator
- **HSV Plant Signature** — rejects non-plant images via green hue dominance check
- **Shannon Entropy Gate** — filters low-complexity blank/solid-color images
- **Edge Density Analysis** — detects synthetic/generated images lacking organic texture
- **Laplacian Blur Detector** — rejects blurry uploads before inference runs

### 🤖 AI Advisory Engine (Gemini 1.5 Flash)
- **Structured JSON Output** — strict schema enforcement with fallback template cache
- **Multilingual Support** — full advisory in: `English`, `Hindi`, `Marathi`, `Telugu`, `Tamil`, `Kannada`, `Bengali`, `Punjabi`
- **Tier-Based Gating** — Gemini only called for ≥45% confidence (cost + accuracy guard)
- **Confidence Gap Uncertainty Flagging** — flags predictions where top-2 difference < 20%
- **JSON Parse Hardening** — regex-based markdown fence stripping, safe fallback on parse failure

### 🏛️ Government Scheme Integration
- Automatically surfaces **relevant Indian agricultural schemes** based on detected crop + disease severity
- Includes Pradhan Mantri Fasal Bima Yojana, Kisan Call Centre (1800-180-1551), and crop-specific schemes
- Minimum severity gating prevents irrelevant scheme suggestions for healthy/low-risk plants

### 📊 Risk Scoring System
```
risk_score = (confidence × 100 × 0.6) +
             (confidence_gap × 100 × 0.1) +
             (lesion_density % × 0.2) +
             (severity_factor × 100 × 0.1)

Categories: Low (0–39) | Moderate (40–69) | High (70–100)
```

### 🌤️ Weather Context Integration
- Live weather data via Open-Meteo API (temperature, humidity, precipitation)
- **Disease risk modifier** — `Elevated` (humidity >75%), `Normal`, or `Reduced` (<30%)
- Fully async with 3s timeout — never blocks prediction response

### ⚡ Performance & Reliability
- **Async FastAPI** with `run_in_executor` for non-blocking TensorFlow inference
- **Semaphore concurrency control** (max 5 concurrent inferences)
- **SlowAPI rate limiting** — 10/minute, 100/day per IP
- **Deep health check endpoint** (`/health`) with model warmup status, Gemini config status, and request counters
- **Readiness probe** (`/health/ready`) for Kubernetes/Render infrastructure

---

## 📁 Repository Structure

```
LeafSense-AI/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes.py       # All API endpoints
│   │   ├── core/
│   │   │   ├── model_loader.py # MobileNetV2 loader + warmup
│   │   │   ├── predictor.py    # Preprocessing + inference pipeline
│   │   │   ├── ood_detector.py # HSV + entropy + edge OOD validator
│   │   │   └── concurrency.py  # Thread-safe inference + semaphore
│   │   ├── services/
│   │   │   └── gemini_service.py # Gemini 1.5 Flash integration
│   │   ├── schemas/            # Pydantic response models
│   │   ├── utils/              # Image validation, blur check
│   │   ├── config.py           # Pydantic settings (env-driven)
│   │   └── main.py             # FastAPI app, CORS, rate limiting
│   ├── data/
│   │   ├── government_schemes.json
│   │   └── disease_calendar.json
│   ├── models/
│   │   └── plant_disease_model.h5
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Next.js 15 frontend
│   ├── app/                    # App Router pages
│   ├── components/             # UI components
│   └── lib/                    # API hooks, type definitions
│
├── .dockerignore
├── .gitignore
├── DEPLOYMENT.md
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- A trained MobileNetV2 `.h5` model at `backend/models/plant_disease_model.h5`

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt

# Create .env in project root:
echo "GEMINI_API_KEY=your_key_here" > .env
echo "MODEL_PATH=models/plant_disease_model.h5" >> .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

---

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Render + Vercel deployment steps.

**Environment Variables:**

| Variable | Where | Value |
|---|---|---|
| `GEMINI_API_KEY` | Render | Your Google Gemini API key |
| `FRONTEND_URL` | Render | `https://your-app.vercel.app` |
| `MODEL_PATH` | Render | `models/plant_disease_model.h5` |
| `NEXT_PUBLIC_API_URL` | Vercel | `https://your-backend.onrender.com` |

---

## 🔌 API Reference

### `POST /predict`
Analyzes a plant image for disease.

**Parameters:**
- `file`: Image file (JPEG/PNG, max 5MB)
- `language`: `en` | `hi` | `mr` | `te` | `ta` | `kn` | `bn` | `pa` (default: `en`)
- `lat`, `lon`: Optional GPS coordinates for weather context
- `expert_mode`: Boolean — includes raw image metrics

**Response:**
```json
{
  "scan_id": "scan_1234567",
  "prediction": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "confidence": 0.87,
    "top_k": [
      {"label": "Tomato Early Blight", "confidence": 0.87},
      {"label": "Tomato Septoria Leaf Spot", "confidence": 0.09}
    ]
  },
  "ai_analysis": {
    "disease_name": "Early Blight (Alternaria solani)",
    "severity": "High",
    "cause": "Fungal infection thriving in warm, humid conditions.",
    "immediate_action": "Remove and destroy infected leaves immediately.",
    "treatment_plan": ["Apply copper-based fungicide.", "Prune lower leaves."],
    "prevention": "Rotate crops annually. Use drip irrigation.",
    "estimated_crop_loss_risk": "High",
    "consult_expert": true,
    "advisory_valid": true
  },
  "risk_score": 78,
  "risk_category": "High",
  "tier": "Tier 1: High Confidence Diagnosis",
  "uncertainty_flag": false,
  "government_schemes": [
    {
      "scheme_name": "Pradhan Mantri Fasal Bima Yojana",
      "eligibility": "All farmers with land records in notified areas",
      "helpline": "1800-200-7710",
      "official_url": "https://pmfby.gov.in"
    }
  ],
  "weather_context": {
    "temperature_c": 28.5,
    "humidity_pct": 82.0,
    "disease_risk_modifier": "Elevated"
  }
}
```

### `GET /health`
Deep health check with model and Gemini status.

### `GET /health/ready`
Kubernetes-compatible readiness probe.

---

## 🏆 Technical Differentiators

| Feature | LeafSense AI | Generic Plant App |
|---|---|---|
| OOD Rejection | ✅ HSV + Entropy + Edge | ❌ Raw softmax only |
| Multilingual | ✅ 8 Indian languages | ❌ English only |
| Gov. Schemes | ✅ Severity-gated | ❌ None |
| Confidence Calibration | ✅ Temperature scaling | ❌ Raw softmax |
| Weather Integration | ✅ Live via Open-Meteo | ❌ None |
| Rate Limiting | ✅ SlowAPI (10/min) | ❌ None |
| Uncertainty Flagging | ✅ Gap-based | ❌ None |
| Concurrency Safety | ✅ Semaphore-gated TF | ❌ Event loop blocking |

---

## 📜 License

MIT © 2025 LeafSense AI Team
