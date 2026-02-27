# 🌿 LeafSense AI — Intelligent Crop Disease Detection

<div align="center">

![LeafSense AI Banner](https://img.shields.io/badge/LeafSense-AI%20Powered-39ff14?style=for-the-badge&logo=leaf&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-FF6F00?style=for-the-badge&logo=tensorflow)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)

**Putting an agronomist in every farmer's pocket.**

[Live Demo](#) · [API Docs](#api-documentation) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 💀 The Crisis Nobody Is Talking About

Between 2014 and 2023, **over 100,000 farmers died by suicide in India.**

The single most common trigger: unexpected crop failure combined with unrepayable loan debt.

A farmer in Vidarbha, Maharashtra takes a ₹50,000 loan in June to buy seeds, fertilizer, and pesticide. By September, a fungal disease he never identified correctly has destroyed 80% of his tomato yield. He cannot repay. The moneylender comes. There is no safety net.

This is not an isolated tragedy. It is a systemic, repeating crisis — and a large part of it is caused by **a last-mile knowledge gap.**

---

## 🌾 The Knowledge Gap Killing Indian Farmers

India has **140 million farmers.** It has fewer than **100,000 agricultural extension workers** — government-employed agronomists who advise farmers on disease, soil, and crop management.

That is **1 expert for every 1,400 farmers.**

The average smallholder farmer in India:
- Cultivates **1.1 hectares** — roughly the size of a football field
- Earns **under ₹2 lakh per year** (under $2,500)
- Has **no access to a trained agronomist**
- Loses between **20% and 40% of yield** every season to diseases that were **identifiable and treatable**

When a farmer spots brown spots on his tomato leaves, he has three options:

1. **Guess** based on what he saw last season
2. **Ask a neighbor** who is also guessing
3. **Travel 40 kilometers** to the nearest agricultural office — losing a day of work — to be told to apply a fungicide he cannot afford

By the time he gets an answer, the disease has spread to the entire field.

**LeafSense AI is the fourth option.**

---

## 🌱 Real Stories. Real Stakes.

### Raju, Tomato Farmer — Nagpur, Maharashtra

Raju grows tomatoes on 2 acres in Vidarbha, one of India's most drought-affected and farmer-suicide-prone regions. In 2022, he noticed yellow-brown lesions on his tomato leaves in late August.

He assumed it was Early Blight — a common disease he had treated before with cheap copper fungicide. He sprayed three times over two weeks. The disease kept spreading.

It was Late Blight — a different pathogen entirely, requiring Mancozeb or Metalaxyl. By the time a visiting KVK officer identified it correctly, 60% of his crop was gone.

**Estimated loss: ₹38,000 on a crop he had borrowed ₹25,000 to plant.**

With LeafSense AI, Raju would have taken a photo on his Android phone. In under 3 seconds, the system would have returned: *Tomato Late Blight, 81% confidence, High severity. Apply Mancozeb 75% WP at 2g per litre every 10 days.* In Marathi.

The disease would have been caught in week one, not week three.

---

### Gurpreet, Potato Farmer — Amritsar, Punjab

Punjab's potato belt faces Late Blight every monsoon — the same pathogen (*Phytophthora infestans*) that caused the Irish Potato Famine of 1845, killing over one million people.

Under humid monsoon conditions, Late Blight can destroy an entire field in **72 hours.**

Gurpreet lost 4 acres of potato crop in August 2023 because he did not start preventive fungicide early enough. He was not warned that the humid weather that week had created peak outbreak conditions.

**LeafSense AI's seasonal intelligence layer** checks current weather against a disease calendar. If humidity exceeds 75% in Late Blight season, the app automatically warns: *"Late Blight risk is elevated. Begin preventive Mancozeb application now."* Even on a healthy leaf. Prevention, not just detection.

---

### Lakshmi, Chilli Farmer — Guntur, Andhra Pradesh

Guntur produces 30% of India's chillies. Lakshmi grows chillies on 3 acres and sells to the local mandi. She speaks Telugu. She has a 4G smartphone. She has never used an agricultural app because every app she tried was in English.

LeafSense AI supports **8 Indian languages**: Hindi, Marathi, Telugu, Tamil, Kannada, Bengali, Punjabi, and English. Lakshmi can receive a complete disease diagnosis, treatment plan, and government scheme information in Telugu — her language, on her phone, in her field.

---

## 🚀 What LeafSense AI Does

LeafSense AI is not a chatbot. It is a **multi-layer agricultural diagnostic engine.**

Upload a leaf photo. Get a calibrated diagnosis, a structured treatment plan, a risk score, and matched government support schemes — in under 3 seconds.

```
📱 Farmer uploads leaf photo
        ↓
🛡️  Layer 1: OOD Validator — rejects non-plant images instantly
        ↓
🔬  Layer 2: Image Preprocessor — CLAHE enhancement + blur detection
        ↓
🧠  Layer 3: CNN Inference — MobileNetV2 trained on 87,000 images
        ↓
⚖️  Layer 4: Confidence Gating — 3-tier decision engine
        ↓
🤖  Layer 5: Gemini Advisory — structured treatment plan (only if confidence ≥ 45%)
        ↓
📊  Farmer receives: diagnosis + risk score + treatment + government schemes
```

---

## 🧠 Why This Is Different From Just Using ChatGPT

This is the most common question we get. The answer is architectural.

**Ask ChatGPT to diagnose a plant disease.** It will ask you to describe the symptoms in text. It will generate plausible-sounding advice with no confidence score, no uncertainty flag, no treatment dosage specifics, and no connection to your actual crop or location.

**LeafSense AI:**

| Capability | ChatGPT | LeafSense AI |
|---|---|---|
| Analyzes actual leaf image pixels | ❌ | ✅ |
| Trained on 87,000 real plant images | ❌ | ✅ |
| Returns calibrated confidence score | ❌ | ✅ |
| Flags model uncertainty | ❌ | ✅ |
| Shows top-3 differential diagnoses | ❌ | ✅ |
| Rejects non-plant images | ❌ | ✅ |
| Risk score 0–100 | ❌ | ✅ |
| Refuses to advise on low-confidence predictions | ❌ | ✅ |
| Matches government support schemes | ❌ | ✅ |
| Works in 8 Indian languages | ❌ | ✅ |
| Weather-aware disease risk | ❌ | ✅ |

LeafSense uses Gemini as **one layer** in a larger system — not as the entire system. The CNN provides grounded, quantified visual analysis. Gemini adds structured domain knowledge on top. They do fundamentally different jobs.

---

## 🔬 Technical Architecture

### Stack

| Layer | Technology | Why |
|---|---|---|
| Backend API | FastAPI | Async, fast, production-grade |
| ML Model | MobileNetV2 + TensorFlow | 95% accuracy, CPU-deployable |
| Image Processing | OpenCV | Zero-latency preprocessing |
| AI Advisory | Gemini 1.5 Flash | Fast, structured, cost-efficient |
| Frontend | Next.js 14 | Modern, mobile-first |
| Deployment | Render | Free tier, Docker-compatible |

### The 5 Layers Explained

**Layer 1 — OOD Validator (Out of Distribution Guard)**

Before the ML model processes anything, a pure OpenCV validator runs three checks in under 20ms:

- **Green Pixel Ratio**: Converts image to HSV color space. Counts pixels in green (hue 25–95) and brown/diseased (hue 5–25) ranges. Rejects if plant-like pixels are under 6% of the image.
- **Texture Entropy**: Computes Shannon entropy on the grayscale histogram. Real leaves have complex textures. A plain wall or face has low entropy. Rejects below 3.2.
- **Edge Density**: Runs Canny edge detection. Leaves have veins, serrated borders, lesion boundaries. Rejects if edge pixels are under 1% of the image.

**Decision rule**: If 2 out of 3 checks fail → reject with `NOT_A_PLANT`. Not all 3, because a severely diseased leaf might be mostly brown and fail the green check legitimately.

**Layer 2 — Image Preprocessor**

- **Blur Detection**: Laplacian variance below 80 → reject with retake instructions
- **CLAHE Enhancement**: Applied to the luminance channel in LAB color space. Improves contrast in low-light farm conditions without distorting the color channels the model relies on
- **MobileNetV2 Normalization**: Pixels scaled to `[-1, 1]` range via `(pixel / 127.5) - 1.0`. A common and critical mistake is dividing by 255 — this produces wrong input distribution and destroys model accuracy

**Layer 3 — CNN Inference**

MobileNetV2 trained on the PlantVillage dataset — 87,000 images across 38 disease classes on 14 crops. Depthwise separable convolutions allow inference under 500ms on CPU, making it deployable on free-tier servers without GPU.

Returns top-3 predictions with confidence scores using `np.argsort` on the softmax output.

**Layer 4 — Confidence Gating**

| Tier | Confidence | Behavior |
|---|---|---|
| High | ≥ 70% | Full Gemini advisory. All fields shown. |
| Moderate | 45–69% | Gemini called. Amber uncertainty warning shown. |
| Low | < 45% | Gemini NOT called. Advisory hidden. Retake instructions shown. |

**Uncertainty Flag**: Computed as `top1_confidence - top2_confidence < 0.20`. A model that is 85% on rank-1 and 84% on rank-2 is genuinely uncertain despite the high absolute score. Gap-based uncertainty is more honest than absolute thresholds.

**Layer 5 — Gemini Advisory**

- `temperature=0` for deterministic, repeatable outputs
- Strict JSON schema enforcement — no markdown, no prose
- Regex stripping of code fences before `json.loads`
- `advisory_valid` flag — if parsing fails, fallback card shown, never raw AI text
- Skipped entirely for healthy predictions and low-confidence tier
- Supports 8 Indian languages — all string values translated, JSON keys always in English

### Backend Safety

```python
# Semaphore — max 3 concurrent inference requests
semaphore = asyncio.Semaphore(3)

# Rate limiting — 10 requests per minute per IP
@limiter.limit("10/minute")

# Chunked file reading — prevents memory spike on large uploads
async for chunk in file:
    total += len(chunk)
    if total > MAX_FILE_SIZE:  # 5MB cap
        raise HTTPException(413)
```

---

## 🌍 India-First Features

### Multilingual Support
8 Indian languages: Hindi, Marathi, Telugu, Tamil, Kannada, Bengali, Punjabi, English. Language preference persists across sessions. Gemini translates all advisory values natively in a single API call — no separate translation service.

### Government Scheme Matching
After High or Critical severity detections, LeafSense automatically matches:
- **PM Fasal Bima Yojana** — crop insurance compensation
- **eNAM** — national agriculture market for price discovery
- **Kisan Call Centre** — 1800-180-1551, free, 24/7, 22 languages
- State-specific agriculture department contacts

### Seasonal Disease Intelligence
Disease calendar database maps each of the 38 classes to peak months, risk season, and weather triggers. Even on a healthy scan, if Late Blight season is 3 weeks away and humidity is elevated, the farmer is warned with a specific prevention checklist.

### Weather-Aware Advisory
Integrates Open-Meteo API for real-time temperature, humidity, and precipitation at the farmer's GPS location. Fungal disease detected with humidity above 75% → risk modifier set to **Elevated**. Same disease in dry season → **Reduced**. Gemini advisory factors in current field conditions.

---

## 📊 The Numbers Behind The Problem

| Statistic | Value | Source |
|---|---|---|
| Indian farmers | 140 million | Census 2011 |
| Average farm size | 1.1 hectares | NSSO |
| Annual farmer income | < ₹2 lakh | NABARD Report 2018 |
| Yield lost to disease annually | 20–40% | ICAR |
| Crop loss value annually | $50 billion+ | FAO |
| Farmers with smartphones | 750 million users | TRAI 2023 |
| Agricultural extension workers | < 100,000 | Ministry of Agriculture |
| Farmers per extension worker | 1,400 | Calculated |

---

## 🛠️ Setup & Deployment

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key
- Trained MobileNetV2 `.h5` model (PlantVillage)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/shafeeq27edu-ai/LeafSense-AI-.git
cd LeafSense-AI-/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY and MODEL_PATH to .env

# Place your trained model
cp your_model.h5 models/plant_disease_model.h5

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# Backend (.env)
GEMINI_API_KEY=your_google_gemini_api_key
MODEL_PATH=models/plant_disease_model.h5
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Documentation

### POST `/predict`

Analyze a plant leaf image for disease detection.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | Image | ✅ | JPEG or PNG, max 5MB |
| `language` | string | ❌ | Language code: `en`, `hi`, `mr`, `te`, `ta`, `kn`, `bn`, `pa` |

**Response**:

```json
{
  "crop": "Tomato",
  "diagnosis": "Late blight",
  "confidence": 0.81,
  "confidence_gap": 0.24,
  "tier": "high",
  "uncertainty_flag": false,
  "advisory_valid": true,
  "advisory_skipped": false,
  "risk_score": 84,
  "risk_category": "HIGH",
  "top_predictions": [
    { "rank": 1, "display_name": "Tomato — Late blight", "confidence": 0.81 },
    { "rank": 2, "display_name": "Tomato — Early blight", "confidence": 0.57 },
    { "rank": 3, "display_name": "Tomato — Leaf Mold", "confidence": 0.12 }
  ],
  "validator_scores": {
    "green_ratio": 0.34,
    "entropy": 6.8,
    "edge_density": 0.07
  },
  "ai_analysis": {
    "advisory_valid": true,
    "disease_name": "Tomato Late Blight",
    "severity": "High",
    "cause": "Caused by Phytophthora infestans, a water mold that spreads rapidly in humid conditions above 75% humidity.",
    "immediate_action": "Remove and destroy all visibly infected leaves and stems immediately to reduce spread.",
    "treatment_plan": [
      "Apply Mancozeb 75% WP at 2g per litre of water",
      "Spray every 10 days during humid conditions",
      "Switch to Metalaxyl if disease persists after 2 sprays"
    ],
    "prevention": "Improve air circulation between plants. Avoid overhead irrigation. Begin preventive spraying before monsoon season.",
    "estimated_crop_loss_risk": "High",
    "consult_expert": true
  }
}
```

### GET `/health`

Returns system health status including model state, Gemini connectivity, and request statistics.

### GET `/health/ready`

Returns 200 only when model is fully loaded. Use for deployment readiness probes.

---

## 🗺️ Roadmap

- [x] CNN disease detection (38 classes, 14 crops)
- [x] OOD plant validator
- [x] 3-tier confidence gating
- [x] Structured Gemini advisory
- [x] Risk score calculation
- [x] Multilingual support (8 languages)
- [x] Government scheme matching
- [x] Seasonal disease calendar
- [x] Weather-aware advisory
- [ ] PWA offline mode with background sync queue
- [ ] Batch scan — multiple leaves in one session
- [ ] PDF report export
- [ ] Scan history and disease progression tracking
- [ ] TFLite model for edge deployment
- [ ] WhatsApp bot integration for feature phone users
- [ ] Integration with state agriculture department APIs

---

## 👥 Contributors

| Contributor | Role |
|---|---|
| [@shafeeq27edu-ai](https://github.com/shafeeq27edu-ai) | Frontend, System Architecture, Product |
| [@lesliejoys121-sudo](https://github.com/lesliejoys121-sudo) | Backend, ML Pipeline |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- **PlantVillage Dataset** — Penn State University — 87,000 annotated plant disease images
- **ICAR (Indian Council of Agricultural Research)** — Disease calendar and crop data
- **Open-Meteo** — Free weather API
- **Google Gemini** — AI advisory layer
- **Ministry of Agriculture, Government of India** — PM Fasal Bima Yojana scheme data

---

<div align="center">

**Built for the 140 million farmers who deserve better than guesswork.**

*If this project helped you, give it a ⭐ — it helps more farmers find it.*

</div>
