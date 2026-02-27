import os
import shutil
from pathlib import Path

ROOT = Path("c:/Projects/PROJECTS/GEN AI - PJ")
BACKEND_DIR = ROOT / "backend"

# Ensure dirs exist
dirs_to_make = [
    "app/api", "app/core", "app/services", "app/schemas", "app/utils",
    "models", "tests"
]
for d in dirs_to_make:
    os.makedirs(BACKEND_DIR / d, exist_ok=True)

# 1. Update config.py
config_code = """from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = "your_google_gemini_api_key_here"
    model_path: str = "models/plant_disease_model.h5"
    labels_path: str = "models/class_labels.json"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

def get_settings() -> Settings:
    return Settings()
"""
(BACKEND_DIR / "app/config.py").write_text(config_code, encoding="utf-8")

# 2. schemas/response.py
response_schema_code = """from pydantic import BaseModel
from typing import List, Optional

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
"""
(BACKEND_DIR / "app/schemas/response.py").write_text(response_schema_code, encoding="utf-8")
(BACKEND_DIR / "app/schemas/request.py").write_text("# Request schemas can go here\n", encoding="utf-8")
(BACKEND_DIR / "app/schemas/__init__.py").write_text("", encoding="utf-8")

# 3. utils/file_validator.py
file_validator_code = """from fastapi import UploadFile, HTTPException
import logging

logger = logging.getLogger(__name__)
MAX_SIZE = 5 * 1024 * 1024

async def validate_and_read_image(file: UploadFile) -> bytes:
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type uploaded: {file.content_type}")
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    chunk_size = 64 * 1024
    image_bytes_array = bytearray()
    
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        image_bytes_array.extend(chunk)
        if len(image_bytes_array) > MAX_SIZE:
            raise HTTPException(
                status_code=413,
                detail={
                    "detail": "File too large. Maximum size is 5MB.",
                    "code": "FILE_TOO_LARGE"
                }
            )
            
    return bytes(image_bytes_array)
"""
(BACKEND_DIR / "app/utils/file_validator.py").write_text(file_validator_code, encoding="utf-8")

# 4. utils/error_handler.py
error_handler_code = """import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global catch: {exc}")
    if isinstance(exc, RateLimitExceeded):
        return await _rate_limit_exceeded_handler(request, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
"""
(BACKEND_DIR / "app/utils/error_handler.py").write_text(error_handler_code, encoding="utf-8")

# 5. core/ood_detector.py
ood_detector_code = """import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def validate_plant_presence(image: np.ndarray):
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_green = np.array([25, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    mask = cv2.inRange(hsv_image, lower_green, upper_green)
    green_ratio = cv2.countNonZero(mask) / (image.shape[0] * image.shape[1])
    
    if green_ratio < 0.005:
        logger.warning(f"OOD Rejected: Image contains only {green_ratio*100:.1f}% green pixels.")
        raise ValueError("No plant detected in image.")
"""
(BACKEND_DIR / "app/core/ood_detector.py").write_text(ood_detector_code, encoding="utf-8")

# 6. utils/image_utils.py
image_utils_code = """import cv2
import numpy as np
import tensorflow as tf

def decode_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Invalid or corrupted image file.")
    return image

def resize_and_normalize(image: np.ndarray) -> np.ndarray:
    image_resized = cv2.resize(image, (224, 224))
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    image_float = np.array(image_rgb, dtype=np.float32)
    image_normalized = tf.keras.applications.mobilenet_v2.preprocess_input(image_float)
    return np.expand_dims(image_normalized, axis=0)
"""
(BACKEND_DIR / "app/utils/image_utils.py").write_text(image_utils_code, encoding="utf-8")
(BACKEND_DIR / "app/utils/__init__.py").write_text("", encoding="utf-8")

# 7. core/predictor.py
predictor_code = """from app.core.ood_detector import validate_plant_presence
from app.utils.image_utils import decode_image, resize_and_normalize

def preprocess_image(image_bytes: bytes):
    image = decode_image(image_bytes)
    validate_plant_presence(image)
    return resize_and_normalize(image)
"""
(BACKEND_DIR / "app/core/predictor.py").write_text(predictor_code, encoding="utf-8")

# 8. core/model_loader.py
# Just copy from app/model_loader.py but keep imports clean
model_loader_code = """import os
import json
import logging
import tensorflow as tf
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def load_class_labels(labels_path: str) -> dict:
    if not os.path.exists(labels_path):
        raise FileNotFoundError(f"Class labels not found at {labels_path}")
    with open(labels_path, 'r') as f:
        labels = json.load(f)
    logger.info(f"Loaded {len(labels)} class labels from {labels_path}")
    return labels

def load_and_validate_model(model_path: str, expected_num_classes: int):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train or download the model.")
    logger.info(f"Loading real model from {model_path}...")
    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {e}")
        raise RuntimeError(f"Failed to load model from {model_path}: {e}")

    output_shape = model.output_shape
    num_classes = output_shape[-1]
    logger.info(f"Model output classes: {num_classes}")
    
    if num_classes != expected_num_classes:
         raise RuntimeError(f"FATAL: Model output shape ({num_classes}) does not match the number of provided class labels ({expected_num_classes}).")
    logger.info("Model validation successful.")
    return model

LABEL_FILE = getattr(settings, 'labels_path', 'models/class_labels.json')

try:
    CLASS_LABELS = load_class_labels(LABEL_FILE)
    cnn_model = load_and_validate_model(settings.model_path, len(CLASS_LABELS))
except FileNotFoundError as fnf_error:
    logger.critical(f"Startup Failure (Missing File): {fnf_error}")
    raise SystemExit(str(fnf_error))
except Exception as startup_error:
    logger.critical(f"Startup Validation Failed: {startup_error}")
    raise SystemExit(f"Initialization Error: {startup_error}")
"""
(BACKEND_DIR / "app/core/model_loader.py").write_text(model_loader_code, encoding="utf-8")

# 9. core/concurrency.py
concurrency_code = """import asyncio
import numpy as np
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.model_loader import cnn_model, CLASS_LABELS
from app.core.predictor import preprocess_image

inference_lock = asyncio.Semaphore(1)

async def _run_inference_safely(image_bytes: bytes) -> dict:
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    processed_image = preprocess_image(image_bytes)
        
    try:
        await asyncio.wait_for(inference_lock.acquire(), timeout=5.0)
        try:
            prediction_probs = await run_in_threadpool(cnn_model.predict, processed_image)
        finally:
            inference_lock.release()
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=503, 
            detail="High demand. Please retry in a few seconds."
        )
        
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
"""
(BACKEND_DIR / "app/core/concurrency.py").write_text(concurrency_code, encoding="utf-8")
(BACKEND_DIR / "app/core/__init__.py").write_text("", encoding="utf-8")

# 10. services/gemini_service.py
original_gemini = (ROOT / "app/gemini_client.py").read_text(encoding="utf-8")
(BACKEND_DIR / "app/services/gemini_service.py").write_text(original_gemini, encoding="utf-8")
(BACKEND_DIR / "app/services/__init__.py").write_text("", encoding="utf-8")

# 11. dependencies.py
dependencies_code = """from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
"""
(BACKEND_DIR / "app/dependencies.py").write_text(dependencies_code, encoding="utf-8")

# 12. api/routes.py
routes_code = """import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse

from app.dependencies import limiter
from app.core.model_loader import cnn_model, CLASS_LABELS
from app.core.concurrency import _run_inference_safely
from app.services.gemini_service import get_ai_analysis, settings
from app.schemas.response import DetectionResponse, Prediction, AIAnalysis
from app.utils.file_validator import validate_and_read_image

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Welcome to AgriVision AI Production"}

@router.get("/health")
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

@router.get("/demo-samples")
@limiter.limit("10/minute")
async def get_demo_samples(request: Request):
    return [
        {"name": "Tomato Early Blight", "image_url": "/static/demo/tomato_blight.jpg"},
        {"name": "Healthy Apple Leaf", "image_url": "/static/demo/apple_healthy.jpg"},
        {"name": "Corn Common Rust", "image_url": "/static/demo/corn_rust.jpg"}
    ]

@router.post("/predict", response_model=DetectionResponse)
@limiter.limit("5/minute")
async def predict_disease(request: Request, file: UploadFile = File(...)):
    image_bytes = await validate_and_read_image(file)
        
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
        return JSONResponse(status_code=400, content={"detail": str(ve)})
    except Exception as e:
        logger.error(f"Internal API Error: {e}")
        raise e
"""
(BACKEND_DIR / "app/api/routes.py").write_text(routes_code, encoding="utf-8")
(BACKEND_DIR / "app/api/__init__.py").write_text("", encoding="utf-8")

# 13. main.py
main_code = """import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.api.routes import router
from app.dependencies import limiter
from app.utils.error_handler import global_exception_handler, _rate_limit_exceeded_handler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

if not settings.frontend_url:
    logger.critical("PRODUCTION ERROR: FRONTEND_URL is not set.")
    raise SystemExit("Fatal: Missing FRONTEND_URL environment variable.")

app = FastAPI(
    title="AgriVision AI Production",
    description="Backend API for detecting plant diseases using FastApi, CNN (MobileNetV2), and providing treatment via Gemini.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)
"""
(BACKEND_DIR / "app/main.py").write_text(main_code, encoding="utf-8")
(BACKEND_DIR / "app/__init__.py").write_text("", encoding="utf-8")

# 14. tests/test_api.py
tests_code = """from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to AgriVision AI Production"}
"""
(BACKEND_DIR / "tests/test_api.py").write_text(tests_code, encoding="utf-8")
(BACKEND_DIR / "tests/__init__.py").write_text("", encoding="utf-8")

# 15. Move requirements & Dockerfile
for file_name in ["requirements.txt", "Dockerfile", "evaluate_model.py", "train_model.py"]:
    if (ROOT / file_name).exists():
        shutil.move(str(ROOT / file_name), str(BACKEND_DIR / file_name))

# 16. Delete original app folder to complete backend restructuring (and models if it exists out of backend)
if (ROOT / "app").exists():
    shutil.rmtree(ROOT / "app")
if (ROOT / "models").exists():
    shutil.move(str(ROOT / "models"), str(BACKEND_DIR / "models"))

print("Backend restructured completely.")
