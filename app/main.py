import logging
import asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List

from app.predictor import preprocess_image
from app.model_loader import cnn_model, CLASS_LABELS
from app.gemini_client import get_ai_analysis
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriVision AI Production",
    description="Backend API for detecting plant diseases using FastApi, CNN (MobileNetV2), and providing treatment via Gemini.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Global Semaphore to prevent extreme concurrency OOM / blocking
inference_lock = asyncio.Semaphore(1)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global catch: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

class AIAnalysis(BaseModel):
    summary: str
    severity: str
    treatment_steps: List[str]
    prevention_tips: List[str]

class Prediction(BaseModel):
    crop: str
    disease: str
    confidence: float

class DetectionResponse(BaseModel):
    prediction: Prediction
    ai_analysis: AIAnalysis

@app.get("/")
async def root():
    return {"message": "Welcome to AgriVision AI Production"}

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "service": "agrivision-backend",
        "model_loaded": cnn_model is not None
    }

async def _run_inference_safely(image_bytes: bytes) -> dict:
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    try:
        processed_image = preprocess_image(image_bytes)
    except Exception as e:
        raise ValueError("Invalid or corrupted image file.")
        
    # Execute synchronous MobileNet prediction exclusively on a threadpool
    # Wrapped in a Semaphore(1) lock to prevent OOM
    async with inference_lock:
        prediction_probs = await run_in_threadpool(cnn_model.predict, processed_image)
        
    class_idx = int(np.argmax(prediction_probs[0]))
    confidence = float(prediction_probs[0][class_idx])
    
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
        "confidence": confidence
    }

@app.post("/predict", response_model=DetectionResponse)
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type uploaded: {file.content_type}")
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    # Check Payload size (5MB Limit)
    MAX_SIZE = 5 * 1024 * 1024
    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Payload Too Large. Maximum size is 5MB.")
        
    try:
        prediction_result = await _run_inference_safely(image_bytes)
        
        # Skip LLM context injection if confidence is too low natively
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
        # FastAPI will catch and format HTTP exceptions properly
        raise he
    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error": "Invalid or corrupted image file."})
    except Exception as e:
        logger.error(f"Internal API Error: {e}")
        # The Global @app.exception_handler handles everything else and returns 500 JSON
        raise e
