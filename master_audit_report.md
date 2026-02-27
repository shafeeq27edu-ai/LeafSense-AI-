# MASTER IMPLEMENTATION AUDIT REPORT

## SECTION 1 — Core ML Pipeline
- **Is preprocessing using mobilenet_v2.preprocess_input()?**
  ✔ **FULLY IMPLEMENTED** (`backend/app/utils/image_utils.py` and `backend/train_model.py`)
- **Is image resizing strictly 224x224 before inference?**
  ✔ **FULLY IMPLEMENTED** (`cv2.resize` to 224x224 in `backend/app/utils/image_utils.py`)
- **Is inference wrapped inside run_in_threadpool()?**
  ✔ **FULLY IMPLEMENTED** (`backend/app/core/concurrency.py`)
- **Is there an asyncio.Semaphore soft queue with timeout?**
  ✔ **FULLY IMPLEMENTED** (Semaphore initialized with 12s wait timeout in `concurrency.py`)
- **Is TFLite being used in production or full TensorFlow?**
  ✘ **NOT IMPLEMENTED** (Full TensorFlow `tf.keras.models.load_model` is used in `backend/app/core/model_loader.py` instead of TFLite)
- **Is top-3 extraction implemented using np.argsort()?**
  ✔ **FULLY IMPLEMENTED** (`backend/app/core/concurrency.py`)
- **Is uncertainty_flag based on confidence gap (<0.20)?**
  ✘ **NOT IMPLEMENTED** (Missing exact `<0.20` gap logic; relies only on a `< 0.60` flat confidence check)
- **Are class labels loaded dynamically from JSON?**
  ✔ **FULLY IMPLEMENTED** (`backend/app/core/model_loader.py`)
- **Is low-confidence gating threshold implemented correctly?**
  ✔ **FULLY IMPLEMENTED** (Gating at `< 0.60` found in `backend/app/api/routes.py`)

## SECTION 2 — OOD Plant Validator
- **Is plant_validator.py present?**
  ⚠ **PARTIALLY IMPLEMENTED** (Functionality exists but is named `ood_detector.py`)
- **Does it check HSV green ratio?**
  ✔ **FULLY IMPLEMENTED** (`ood_detector.py` line 14-27)
- **Does it compute entropy?**
  ✔ **FULLY IMPLEMENTED** (Texture entropy computed in `ood_detector.py`)
- **Does it compute edge density?**
  ✔ **FULLY IMPLEMENTED** (Canny edge density computed in `ood_detector.py`)
- **Is composite scoring used?**
  ✔ **FULLY IMPLEMENTED** (Checks failures >= 2 across the three metrics)
- **Is validator executed BEFORE inference?**
  ✘ **NOT IMPLEMENTED** (`validate_plant_presence` from `ood_detector.py` is NEVER called in `routes.py` or concurrency pipeline)
- **Does it return structured ValidationResult?**
  ✘ **NOT IMPLEMENTED** (Returns a raw Tuple instead of a structured ValidationResult class/pydantic model)
- **Does backend return HTTP 422 with NOT_A_PLANT code?**
  ✘ **NOT IMPLEMENTED** (`NOT_A_PLANT` is defined in error maps but never raised in the API flow)

## SECTION 3 — Gemini Hardening
- **Is temperature set to 0?**
  ✔ **FULLY IMPLEMENTED** (`backend/app/services/gemini_service.py`)
- **Is max_output_tokens capped?**
  ✔ **FULLY IMPLEMENTED** (Capped at 500)
- **Is Gemini 1.5 Flash used instead of Pro?**
  ✔ **FULLY IMPLEMENTED** (`gemini-1.5-flash-latest` configured)
- **Is JSON-only output enforced in prompt?**
  ✔ **FULLY IMPLEMENTED** (Prompt strictly enforces JSON schema)
- **Are markdown code fences stripped via regex?**
  ✔ **FULLY IMPLEMENTED** (Regex stripping found in `gemini_service.py` lines 70-72)
- **Is json.loads wrapped in try/except?**
  ✔ **FULLY IMPLEMENTED** (Handled in `gemini_service.py`)
- **Is fallback raw_advice returned on parse failure?**
  ✔ **FULLY IMPLEMENTED**
- **Is Gemini skipped for "healthy" predictions?**
  ✔ **FULLY IMPLEMENTED** (Checked in both `gemini_service.py` and `routes.py`)
- **Is advisory skipped for low-confidence cases?**
  ✔ **FULLY IMPLEMENTED** (Skipped in `routes.py` if confidence < 0.60)

## SECTION 4 — API Safety & Concurrency
- **Chunked file reading with max 5MB enforcement**
  ✔ **FULLY IMPLEMENTED** (`backend/app/utils/file_validator.py`)
- **No await file.read() full memory load**
  ✔ **FULLY IMPLEMENTED** (Uses 64kb chunked reads)
- **slowapi installed and configured**
  ✔ **FULLY IMPLEMENTED**
- **10/min and 100/day limits active**
  ⚠ **PARTIALLY IMPLEMENTED** (10/min limit exists on `/predict`, but 100/day limit is missing)
- **429 custom handler implemented**
  ✔ **FULLY IMPLEMENTED** (RateLimitExceeded handler returns 429 in `error_handler.py`)
- **Semaphore wait timeout logic**
  ✔ **FULLY IMPLEMENTED** (12s timeout applied to Semaphore wait)
- **Global exception handler implemented**
  ✔ **FULLY IMPLEMENTED** (`global_exception_handler` bound in `main.py`)
- **Unified error schema enforced**
  ✔ **FULLY IMPLEMENTED**
- **CORS restricted (not wildcard)**
  ✔ **FULLY IMPLEMENTED** (Restricted to `settings.frontend_url`)
- **Rate limit not applied to /health**
  ✔ **FULLY IMPLEMENTED**

## SECTION 5 — Health & Monitoring
- **Startup warmup inference**
  ✔ **FULLY IMPLEMENTED** (Warmup logic runs in `model_loader.py`)
- **model_healthy flag exists**
  ✔ **FULLY IMPLEMENTED** (`_health_state["warmup_passed"]` flag used)
- **/health returns detailed JSON**
  ✔ **FULLY IMPLEMENTED** (Returns status, model info, and gemini config)
- **/health/ready exists**
  ✔ **FULLY IMPLEMENTED**
- **requests_served counter**
  ✘ **NOT IMPLEMENTED**
- **requests_failed counter**
  ✘ **NOT IMPLEMENTED**
- **model runtime shown (tflite or tensorflow)**
  ✔ **FULLY IMPLEMENTED**

## SECTION 6 — Frontend Logic
- **parseApiError() exists**
  ✘ **NOT IMPLEMENTED** (Not found in frontend grep search)
- **NOT_A_PLANT special UI rendering**
  ✘ **NOT IMPLEMENTED**
- **429 cooldown timer implemented**
  ✘ **NOT IMPLEMENTED** (Cooldown timer UI not found)
- **Top-3 collapsible section**
  ✔ **FULLY IMPLEMENTED** (Alternative Diagnoses details section present in `Results.tsx`)
- **Uncertainty banner logic**
  ✔ **FULLY IMPLEMENTED** (High Uncertainty warning banner in `Results.tsx` for < 0.60 confidence)
- **Confidence tiering (STRONG/MODERATE/WEAK)**
  ✘ **NOT IMPLEMENTED**
- **Gemini JSON fields rendered as structured cards**
  ✔ **FULLY IMPLEMENTED** (`AnalysisCards.tsx`)
- **Demo mode strip**
  ✔ **FULLY IMPLEMENTED** (`DemoSamples.tsx`)
- **Quick demo button**
  ✔ **FULLY IMPLEMENTED** ("Run Quick Demo" button found in `app/page.tsx`)
- **Advisory hidden when invalid**
  ✔ **FULLY IMPLEMENTED**

## SECTION 7 — Final Structural Integrity Score
- **Reliability score**: 7/10
- **Architecture score**: 8/10
- **Demo Safety score**: 5/10
- **Production Readiness score**: 6/10

### Top 5 missing critical implementations
1. The **OOD Validator** is entirely bypassed (`validate_plant_presence` is never called in `routes.py`).
2. The frontend does not parse specific errors or gracefully handle **`NOT_A_PLANT` or `429` rate limit cooldowns**.
3. The specific `< 0.20` **confidence gap** uncertainty logic is missing.
4. Production relies on **full TensorFlow** instead of the lighter, faster TFLite inference model.
5. Missing critical monitoring metrics (`requests_served`, `requests_failed`) that prevent tracking system load and failures over time.

### Top 3 partial implementations
1. `ood_detector.py` returns a raw Tuple instead of a strict, typed `ValidationResult` struct.
2. The `100/day` rate limit constraint is missing from `slowapi` configuration.
3. The OOD validator file is named `ood_detector.py` instead of the expected `plant_validator.py`.

### Biggest remaining demo risk
The OOD validator (`ood_detector.py`) is fully written but **never executed** within the `/predict` pipeline route in `backend/app/api/routes.py`. A user uploading a random image (like a dog or a coffee cup) during the live demo will completely bypass the safety checks and be processed by the CNN, yielding a highly embarrassing hallucinated bot diagnosis.
