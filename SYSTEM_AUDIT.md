# AgriVision AI — Production Reliability & Vulnerability Audit

## 1. Model Validation
* **Preprocessing Alignment:** **PASS**. The implementation in `predictor.py` uses `cv2.cvtColor(BGR2RGB)` followed by `tf.keras.applications.mobilenet_v2.preprocess_input`. This is strictly aligned with how MobileNetV2 was trained (scaling pixels to `[-1, 1]`).
* **Class Label Mapping:** **PASS**. The system attempts to dynamically load `class_labels.json`, falling back to a static dictionary if missing. It uses `.get()` safely to avoid `KeyError` crashes.
* **Inference Failure Cases:** The model assumes the uploaded image is perfectly valid after basic OpenCV decoding. If OpenCV decodes an image but its dimensions are effectively `0x0` or corrupted midway, `cv2.resize()` will throw a severe C++ exception that isn't cleanly handled before passing to the model.
* **Out-of-Distribution (OOD) Images:** **WEAKNESS**. MobileNetV2 uses a softmax layer. Softmax forces probabilities to sum to 1. If you upload a picture of a car, the model *will* assign a high confidence to whichever plant class mathematically looks most like the car. The 60% threshold mitigates *uncertain* images, but structurally different OOD images will bypass the 60% gate entirely and trigger Gemini hallucinations.
* **Threshold Logic:** **PASS (with caveats)**. Blocking Gemini sub-60% is a great cost/time optimization. However, relying purely on softmax confidence for OOD detection is technically flawed (see above).

---

## 2. API Robustness
* **a) Model file missing:** **PASS**. `model_loader.py` catches the `Exception` during load and returns `None`. `predictor.py` immediately checks `if cnn_model is None: raise RuntimeError`, which the main endpoint catches and returns as an explicit HTTP 500 JSON. The server itself does not crash on boot.
* **b) Corrupted image uploaded:** **PARTIAL PASS**. `cv2.imdecode()` handles most corruption by returning `None`, which throws a caught `ValueError`. However, as mentioned, deeply malformed images that bypass `imdecode` might crash OpenCV's resize function `cv2.error`.
* **c) Non-image file uploaded:** **PASS**. Checked at the router level via `file.content_type.startswith("image/")` and rejects instantly with HTTP 400.
* **d) Gemini times out:** **PASS**. The `try/except` block wraps the LLM call and returns a deterministic fallback dictionary without altering the HTTP 200 payload struct.
* **e) Environment variables missing:** **PASS**. `pydantic-settings` provides default values gracefully if `.env` fails to mount.

* **Crash Risks:** Extreme concurrency. Tensorflow is not natively thread-safe out of the box when dealing with `async def` FastAPI endpoints. Because `model.predict()` is synchronous and CPU-bound, running it inside an `async def` blocks the entire FastAPI event loop for ALL users while inference runs. 

---

## 3. LLM Integration
* **Hallucination Minimization:** **PASS**. By passing explicit `crop`, `disease`, and `confidence` strings into the prompt, the LLM is heavily grounded in the deterministic CNN output.
* **Prompt Determinism:** **PASS**. `application/json` MIME type is strictly enforced in `genai.generate_content`, massively reducing the risk of Gemini responding with conversational markdown that breaks the frontend parser.
* **Cost Optimization:** **PASS**. The 60% confidence gate avoids paying for Gemini tokens on blurry/useless images.

---

## 4. Security & Production Safety
* **Security Flaws:** Lack of rate-limiting. A malicious user can spam `POST /predict`, forcing TensorFlow to execute inference continuously, pegging the CPU to 100% and crashing the Docker container (Denial of Service).
* **CORS Risks:** **PASS**. The middleware explicitly instructs the developer to lock `allow_origins=["*"]` down to the specific Vercel URL.
* **Docker Memory Issues:** **WARNING**. `tensorflow-cpu` is extremely heavy (often >800MB RAM footprint). Cheap VPS instances (1GB RAM) will immediately trigger Linux Out-Of-Memory (OOM) killer when Uvicorn boots and loads the `.h5` model into memory.
* **TensorFlow Loading Risks:** Addressed via the async blocking issue in Section 2.

---

## 5. Frontend Integration
* **Backend down handling:** **PASS**. The frontend `fetch` call expects generic HTTP errors and structurally wraps everything in a `try/catch`, rendering a dynamic red toast/component error gracefully.
* **Slow responses:** **PASS**. A custom `<LoadingSpinner />` keeps the UI responsive and provides user feedback during cold-start delays.
* **File size validation:** **PASS**. The `ImageUploader` checks `file.size` against a 5MB threshold entirely client-side, saving bandwidth.

---

## 6. Deployment Readiness
**Safe to demo live?** Yes.
**The 5 biggest real-world failure risks:**
1. **Async Event Loop Blocking:** Fastapi's `async def` running synchronous TensorFlow blocking all simultaneous API requests.
2. **OOD Softmax Failure:** Model confidently returning "Tomato Blight" when shown an image of a dog, resulting in an embarrassing LLM diagnosis.
3. **Memory Limits (OOM):** Render free tier (512MB RAM) instantly crashing when loading TensorFlow.
4. **Denial of Service:** Lack of rate-limiting allowing trivial spamming of the heavy `/predict` endpoint.
5. **OpenCV C++ Exceptions:** Maliciously crafted malformed images crashing the Python runtime natively.

---

## 7. Final Verdict

**Scores:**
* **Reliability:** 7/10
* **Architecture:** 8/10
* **Production Readiness:** 6/10
* **Hackathon Competitiveness:** 9.5/10

### NOT READY — FIX THESE FIRST

To achieve true production viability and survive intense judge scrutiny, you must fix the following architectural flaws:

1. **Fix the Blocking Event Loop (CRITICAL):**
   Change `async def predict_disease_from_image` to `def predict_disease_from_image` OR use `run_in_threadpool`. TensorFlow's `model.predict` is synchronous. If multiple people upload an image during a live demo simultaneously, the server will freeze.

2. **Mitigate OOM Crashes:**
   If deploying to a free tier, you must either upgrade to a 2GB RAM instance or use `tflite_runtime` instead of full `tensorflow` in your `Dockerfile` and `model_loader.py`.

3. **Install Rate Limiting:**
   Add `slowapi` or basic Nginx limiting to prevent trivial DDoS attacks via image upload spam.
