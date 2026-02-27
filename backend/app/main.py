import asyncio, os, time, logging
from contextlib import asynccontextmanager
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.concurrency import run_in_threadpool
from .model_loader import load_model, get_model, is_model_healthy, get_model_runtime
from .predictor import predict_image
from .gemini_client import analyze_with_gemini
from .plant_validator import validate_plant_presence

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leafsense")
limiter = Limiter(key_func=get_remote_address)
semaphore = asyncio.Semaphore(3)
requests_served = 0
requests_failed = 0
startup_time = 0.0
MAX_FILE_SIZE = 5 * 1024 * 1024

@asynccontextmanager
async def lifespan(app: FastAPI):
    global startup_time
    model_path = os.getenv("MODEL_PATH", "models/plant_disease_model.h5")
    load_model(model_path)
    try:
        model = get_model()
        if model:
            t0 = time.time()
            await run_in_threadpool(model.predict, np.zeros((1,224,224,3), dtype=np.float32))
            startup_time = round(time.time() - t0, 3)
            logger.info(f"Warmup done in {startup_time}s")
    except Exception as e:
        logger.error(f"Warmup failed: {e}")
    yield

app = FastAPI(title="LeafSense AI", version="2.0.0", lifespan=lifespan)
app.state.limiter = limiter

app.add_middleware(CORSMiddleware, allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")], allow_credentials=True, allow_methods=["POST","GET"], allow_headers=["*"])

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Too many requests. Please wait before retrying.", "code": "RATE_LIMITED"})

@app.exception_handler(Exception)
async def global_handler(request, exc):
    global requests_failed
    requests_failed += 1
    logger.error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Unexpected error occurred.", "code": "INTERNAL_ERROR"})

@app.get("/health")
async def health():
    loaded = is_model_healthy()
    gemini_ok = bool(os.getenv("GEMINI_API_KEY"))
    status = "healthy" if loaded and gemini_ok else "degraded" if loaded else "unhealthy"
    return JSONResponse(content={"status": status, "model": {"loaded": loaded, "runtime": get_model_runtime(), "warmup_time_s": startup_time}, "gemini": {"api_key_present": gemini_ok}, "stats": {"requests_served": requests_served, "requests_failed": requests_failed}, "version": "2.0.0"}, status_code=503 if status == "unhealthy" else 200)

@app.get("/health/ready")
async def ready():
    if not is_model_healthy():
        raise HTTPException(503, "Model not ready")
    return {"ready": True}

@app.post("/predict")
@limiter.limit("10/minute")
async def predict(request: Request, file: UploadFile = File(...)):
    global requests_served, requests_failed
    if file.content_type not in {"image/jpeg","image/png","image/webp","image/jpg"}:
        raise HTTPException(400, detail="Unsupported file type. Use JPEG or PNG.")
    chunks, total = [], 0
    async for chunk in file:
        total += len(chunk)
        if total > MAX_FILE_SIZE:
            raise HTTPException(413, detail="File too large. Max 5MB.")
        chunks.append(chunk)
    image_bytes = b"".join(chunks)
    try:
        validation = validate_plant_presence(image_bytes)
    except Exception:
        raise HTTPException(422, detail="Image validation failed.")
    if not validation.is_plant:
        raise HTTPException(422, detail=validation.rejection_reason, headers={"X-Error-Code": "NOT_A_PLANT"})
    try:
        await asyncio.wait_for(semaphore.acquire(), timeout=12.0)
    except asyncio.TimeoutError:
        raise HTTPException(503, detail="Server busy. Please retry.", headers={"X-Error-Code": "SERVER_BUSY"})
    try:
        model = get_model()
        if not model:
            raise HTTPException(503, detail="Model not loaded.", headers={"X-Error-Code": "MODEL_ERROR"})
        try:
            prediction = await run_in_threadpool(predict_image, image_bytes, model)
        except ValueError as e:
            raise HTTPException(422, detail=str(e))
        confidence = prediction["confidence"]
        top_preds = prediction.get("top_predictions", [])
        top2_conf = top_preds[1]["confidence"] if len(top_preds) > 1 else 0.0
        confidence_gap = round(confidence - top2_conf, 4)
        uncertainty_flag = confidence_gap < 0.20
        tier = "high" if confidence >= 0.70 else "moderate" if confidence >= 0.45 else "low"
        is_healthy = "healthy" in prediction.get("disease","").lower()
        advisory_skipped, advisory_valid, ai_analysis, gemini_called = False, False, None, False
        if tier == "low":
            advisory_skipped = True
        elif is_healthy:
            advisory_skipped = True
            ai_analysis = {"advisory_valid": True, "disease_name": "Healthy", "severity": "None", "cause": "No disease detected.", "immediate_action": "No action required.", "treatment_plan": [], "prevention": "Maintain regular care.", "estimated_crop_loss_risk": "Low", "consult_expert": False}
            advisory_valid = True
        else:
            gemini_called = True
            try:
                ai_analysis = await analyze_with_gemini(prediction)
                advisory_valid = ai_analysis.get("advisory_valid", True)
            except Exception as e:
                logger.error(f"Gemini failed: {e}")
                ai_analysis = {"advisory_valid": False, "parse_error": True}
        severity = ai_analysis.get("severity","Medium") if ai_analysis else "Low"
        sev_w = {"None":0,"Low":0.3,"Medium":0.5,"High":0.7,"Critical":1.0}.get(severity,0.5)
        risk_score = round((confidence * 0.7 + sev_w * 0.3) * 100)
        risk_category = "LOW" if risk_score < 40 else "HIGH" if risk_score >= 70 else "MODERATE"
        logger.info(f"tier={tier} confidence={confidence:.3f} gemini_called={gemini_called} advisory_valid={advisory_valid}")
        requests_served += 1
        return {"crop": prediction["crop"], "diagnosis": prediction["disease"], "confidence": round(confidence, 4), "confidence_gap": confidence_gap, "tier": tier, "uncertainty_flag": uncertainty_flag, "advisory_valid": advisory_valid, "advisory_skipped": advisory_skipped, "risk_score": risk_score, "risk_category": risk_category, "top_predictions": top_preds, "validator_scores": {"green_ratio": validation.green_ratio, "entropy": validation.entropy, "edge_density": validation.edge_density}, "ai_analysis": ai_analysis}
    finally:
        semaphore.release()
