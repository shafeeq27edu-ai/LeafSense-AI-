# AgriVision AI — Final Production Vulnerability Audit (Post-Hardening)

## 1. Model Validation
* **Preprocessing Matching:** **PASS**. The pipeline now uses `cv2.cvtColor(BGR2RGB)` and `tf.keras.applications.mobilenet_v2.preprocess_input`. The dangerous manual `/255` normalization has been stripped.
* **Label Mapping & Output Shape:** **PASS**. `load_and_validate_model` explicitly checks `model.output_shape[-1]` against `len(CLASS_LABELS)` and forces a `SystemExit` on boot if they mismatch, eliminating silent class shifting.
* **Silent Corruption Risks:** Minimized. Corrupted buffers are caught prior to OpenCV throwing native C++ exceptions.
* **Calibration Risk (60% Threshold):** **WEAKNESS**. Deep learning models are notoriously overconfident. A 60% softmax output is often uncalibrated. A model might be 99% confident on a tomato leaf it has never seen, yet be wrong. Relying solely on softmax thresholding without temperature scaling or Monte Carlo Dropout leaves the system vulnerable to high-confidence false positives.
* **OOD (Out-Of-Distribution) Behavior:** **WEAKNESS**. The system still lacks OOD detection. If a user uploads a picture of a cat, the softmax layer *must* assign probabilities that sum to 1 across the plant classes. If the cat features happen to trigger "Corn Rust" filters with 80% confidence, the "Healthy Plant Guard" fails, the 60% threshold fails, and Gemini generates a treatment for a cat.

---

## 2. API Robustness
* **a) Model file missing:** **PASS**. Raises `SystemExit` instantly with a clear log via `model_loader.py`.
* **b) Corrupted image uploaded:** **PASS**. `cv2.imdecode` returns `None`, raising a `ValueError` intercepted by `main.py` serving HTTP 400.
* **c) Non-image file uploaded:** **PASS**. Checked securely at the FastAPI dependency layer via `file.content_type.startswith("image/")`.
* **d) Gemini times out:** **PASS**. `asyncio.wait_for` enforces an 8-second hard constraint. `asyncio.TimeoutError` yields structured fallback JSON safely.
* **e) Environment variables missing:** **PASS**. Handled gracefully by Pydantic `get_settings()`.
* **Blocking Event Loop:** **PASS**. `run_in_threadpool` successfully delegates synchronous TensorFlow I/O out of the asyncio loop.
* **Concurrent Inference Spikes:** **PASS**. The `asyncio.Semaphore(1)` forces requests to queue natively, preventing OOM multi-threading bursts.

---

## 3. LLM Integration
* **Deterministic Settings:** **PASS**. Parameterized tightly with `temperature=0.0` and `top_p=1.0`.
* **Token Capping:** **PASS**. `max_output_tokens=300` prevents run-away loops and mitigates API abuse pricing.
* **Grounding:** **PASS**. The prompt successfully ingests `{crop}, {disease}, {confidence}` explicitly instructing "No speculation".
* **Gating Execution:** **PASS**. Structurally overrides Gemini via static fallback architectures if `<0.60` confidence or `disease == 'healthy'`.
* **Hallucination Risk:** **MODERATE**. While locked down, if an OOD image achieves 70% confidence for a disease (see Section 1), Gemini will still hallucinate instructions because it believes the CNN. Over-trusting the CNN is the primary weakness.

---

## 4. Security & Production Safety
* **CORS Safety:** **WARNING**. FastApi implements `allow_origins=["*"]`. This is inherently insecure in production. Browsers from any domain can hit your API endpoint.
* **Backend File Size:** **PASS**. Max payload explicitly clamped to `MAX_SIZE = 5 * 1024 * 1024` (5MB).
* **TensorFlow Memory Risk:** **WARNING**. While queue spiking is mitigated by the semaphore, the base load of TensorFlow CPU combined with Uvicorn might still exceed 512MB RAM constraints on nano-tier VPS limits dynamically.
* **Model Loading Execution:** **PASS**. Mounted globally natively at startup. Not reinstantiated per request.
* **Global Exception Fallback:** **PASS**. `@app.exception_handler(Exception)` deployed to prevent 500 error leaks.

---

## 5. Frontend Integration
* **Backend down handling:** The Next.js frontend catches raw Fetch failures cleanly via generic UI `try/catch`.
* **Error Distinguishing:** **WEAKNESS**. The current `ImageUploader` and fetch logic throws a generic string toast on failure. It does not intelligently distinguish or display uniquely for a 400 (Bad Image) vs a 413 (File too Large) vs a 500 (Backend Crash).
* **Loading State:** **PASS**. Responsive visual scanner UI triggers immediately on API request.
* **Retry Logic:** **WEAKNESS**. No automatic exponential backoff retry mechanism configured on the frontend if the connection drops.

---

## 6. Deployment Readiness
**Safe for live demo?** YES.

**Top 5 Failure Risks:**
1. A judge uploading a picture of a face/dog and the CNN mapping it out to a 90% "Apple Scab" disease due to Softmax enforcement.
2. Production CORS `["*"]` allowing other hackers at the event to ping the API directly from their own clients.
3. VPS OOM crashing during Linux boot if deployed on `< 1GB RAM` architecture due to raw `tensorflow` weight.
4. Next.js Fetch API failing networkly locally and the UI not explaining *why* it failed to the user.
5. The 8-Second Gemini Timeout triggering prematurely if the conference WiFi is sluggish, returning "Unknown Advisory".

**3 Highest-Priority Fixes:**
1. **OOD Detection Network:** Implement a dedicated tiny binary classifier (Plant vs Not-Plant) bounding box BEFORE the MobileNetV2 disease classifier executes.
2. **Lock CORS Origin:** Explicitly attach the Vercel production URL into `main.py` `allow_origins`.
3. **Migrate Inference Engine:** Swapping `tensorflow` out for `tflite_runtime` natively cuts the Docker RAM footprint by >60% rendering it far more stable.

---

## 7. Final Verdict

**Scores:**
* **Reliability:** 8.5/10
* **Architecture:** 9/10
* **Production Readiness:** 7.5/10
* **Hackathon Competitiveness:** 9.5/10

### READY FOR DEMO
