import logging
import asyncio
import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List, Optional

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.predictor import preprocess_image
from app.model_loader import cnn_model, CLASS_LABELS
from app.gemini_client import get_ai_analysis, settings
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fast-fail CORS Startup validation
if not settings.frontend_url:
    logger.critical("PRODUCTION ERROR: FRONTEND_URL is not set.")
    raise SystemExit("Fatal: Missing FRONTEND_URL environment variable.")

# Configure Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AgriVision AI Production",
    description="Backend API for detecting plant diseases using FastApi, CNN (MobileNetV2), and providing treatment via Gemini.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],  # Strict Origin Lockdown
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

inference_lock = asyncio.Semaphore(1)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global catch: {exc}")
    # Don't override RateLimitExceeded which is technically an Exception
    if isinstance(exc, RateLimitExceeded):
        return await _rate_limit_exceeded_handler(request, exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

class AIAnalysis(BaseModel):
    summary: str
    severity: str
    treatment_steps: List[str]
    prevention_tips: List[str]

class TopKPrediction(BaseModel):
    label: str
    confidence: float

class Prediction(BaseModel):
    crop: str
    disease: str
    confidence: float
    top_k: Optional[List[TopKPrediction]] = None

class DetectionResponse(BaseModel):
    prediction: Prediction
    ai_analysis: AIAnalysis

@app.get("/")
async def root():
    return {"message": "Welcome to AgriVision AI Production"}

@app.get("/health")
async def health_check():
    cfg_gemini = bool(settings.gemini_api_key and settings.gemini_api_key != "your_google_gemini_api_key_here")
    is_healthy = bool(cnn_model is not None and CLASS_LABELS and cfg_gemini)
    
    return JSONResponse(
        status_code=200 if is_healthy else 503,
        content={
            "status": "ok" if is_healthy else "degraded", 
            "model_loaded": cnn_model is not None,
            "labels_loaded": bool(CLASS_LABELS),
            "gemini_configured": cfg_gemini
        }
    )

@app.get("/demo-samples")
@limiter.limit("10/minute")
async def get_demo_samples(request: Request):
    """Returns guaranteed clean samples for hackathon demonstration."""
    return [
        {"name": "Tomato Early Blight", "image_url": "/static/demo/tomato_blight.jpg"},
        {"name": "Healthy Apple Leaf", "image_url": "/static/demo/apple_healthy.jpg"},
        {"name": "Corn Common Rust", "image_url": "/static/demo/corn_rust.jpg"}
    ]

async def _run_inference_safely(image_bytes: bytes) -> dict:
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    # Preprocess raises ValueError if image is corrupted or OOD (0% green)
    processed_image = preprocess_image(image_bytes)
        
    # Queue Transparency: Don't let users wait silenty for minutes during high load
    if inference_lock.locked():
        raise HTTPException(
            status_code=503, 
            detail={"status": "queued", "message": "High demand. Please retry in a few seconds."}
        )

    async with inference_lock:
        prediction_probs = await run_in_threadpool(cnn_model.predict, processed_image)
        
    probs_array = prediction_probs[0]
    top_3_indices = np.argsort(probs_array)[-3:][::-1]
    
    top_k = []
    for idx in top_3_indices:
        lbl = CLASS_LABELS.get(str(idx)) or CLASS_LABELS.get(idx) or f"Unknown_{idx}"
        top_k.append({
            "label": lbl.replace("___", " - ").replace("_", " "),
            "confidence": float(probs_array[idx])
        })
        
    class_idx = int(top_3_indices[0])
    confidence = float(probs_array[class_idx])
    
    disease_name = CLASS_LABELS.get(str(class_idx)) or CLASS_LABELS.get(class_idx)
    if not disease_name:
         raise RuntimeError(f"Index {class_idx} not found in CLASS_LABELS lookup.")
         
    parts = disease_name.split("___")
    if len(parts) == 2:
        crop = parts[0].replace("_", " ")
        disease = parts[1].replace("_", " ")
    else:
        crop = "Unknown Crop Type"
        disease = disease_name.replace("_", " ")

    return {
        "crop": crop,
        "disease": disease,
        "confidence": confidence,
        "top_k": top_k
    }

@app.post("/predict", response_model=DetectionResponse)
@limiter.limit("5/minute")
async def predict_disease(request: Request, file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type uploaded: {file.content_type}")
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    MAX_SIZE = 5 * 1024 * 1024
    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
         # Standardize JSON error rather than raw string detail
        return JSONResponse(status_code=413, content={"error": "Payload Too Large. Maximum size is 5MB."})
        
    try:
        prediction_result = await _run_inference_safely(image_bytes)
        
        if prediction_result["confidence"] < 0.60:
             return DetectionResponse(
                prediction=Prediction(**prediction_result),
                ai_analysis=AIAnalysis(
                    summary="Low confidence. Please capture a clearer image of the plant leaf.",
                    severity="Uncertain",
                    treatment_steps=[],
                    prevention_tips=[]
                )
            )

        if prediction_result["disease"].strip().lower() == "healthy":
             return DetectionResponse(
                prediction=Prediction(**prediction_result),
                ai_analysis=AIAnalysis(
                    summary="The neural network indicates this plant is healthy.",
                    severity="None",
                    treatment_steps=[],
                    prevention_tips=["Continue current watering and fertilizing schedules.", "Monitor for future anomalies."]
                )
            )

        ai_analysis_result = await get_ai_analysis(
            crop=prediction_result["crop"],
            disease=prediction_result["disease"],
            confidence=prediction_result["confidence"]
        )
        
        return DetectionResponse(
            prediction=Prediction(**prediction_result),
            ai_analysis=AIAnalysis(**ai_analysis_result)
        )
        
    except HTTPException as he:
        raise he
    except ValueError as ve:
        # Matches HSV OOD rejection structure precisely
        return JSONResponse(status_code=400, content={"error": str(ve)})
    except Exception as e:
        logger.error(f"Internal API Error: {e}")
        raise e
