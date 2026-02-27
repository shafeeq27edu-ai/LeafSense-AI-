import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Query
from fastapi.responses import JSONResponse

from app.dependencies import limiter
from app.core.model_loader import cnn_model, CLASS_LABELS
from app.core.concurrency import _run_inference_safely
from app.services.gemini_service import get_ai_analysis, settings
from app.schemas.response import DetectionResponse, BatchDetectionResponse, Prediction, AIAnalysis
from app.utils.file_validator import validate_and_read_image

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Welcome to LeafSense AI Production"}

@router.get("/health")
async def health_check():
    cfg_gemini = bool(settings.gemini_api_key and settings.gemini_api_key != "your_google_gemini_api_key_here")
    
    from app.core.model_loader import get_health_status
    model_status = get_health_status()
    
    is_fully_healthy = model_status["loaded"] and model_status["warmup_passed"] and cfg_gemini
    is_degraded = model_status["loaded"] and model_status["warmup_passed"] and not cfg_gemini
    
    status_str = "healthy" if is_fully_healthy else ("degraded" if is_degraded else "unhealthy")
    
    return JSONResponse(
        status_code=200 if (is_fully_healthy or is_degraded) else 503,
        content={
            "status": status_str,
            "model": model_status,
            "gemini": {
                "api_key_present": cfg_gemini
            },
            "version": "1.0.0"
        }
    )

@router.get("/health/ready")
async def readiness_check():
    from app.core.model_loader import get_health_status
    model_status = get_health_status()
    
    is_ready = model_status["loaded"] and model_status["warmup_passed"]
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={"status": "ready" if is_ready else "not_ready"}
    )

@router.get("/demo-samples")
async def get_demo_samples(request: Request):
    return [
        {"name": "Tomato Early Blight", "image_url": "/static/demo/tomato_blight.jpg"},
        {"name": "Healthy Apple Leaf", "image_url": "/static/demo/apple_healthy.jpg"},
        {"name": "Corn Common Rust", "image_url": "/static/demo/corn_rust.jpg"}
    ]

def calculate_severity_factor(severity_str: str) -> float:
    mapping = {"Critical": 1.0, "High": 0.8, "Medium": 0.5, "Low": 0.2, "None": 0.0}
    return mapping.get(severity_str, 0.5)

@router.post("/predict", response_model=DetectionResponse)
@limiter.limit("10/minute")
async def predict_disease(request: Request, file: UploadFile = File(...), expert_mode: bool = Query(False)):
    image_bytes = await validate_and_read_image(file)
        
    try:
        # returns dict with "crop", "disease", "confidence", "top_k", "metrics"
        prediction_result = await _run_inference_safely(image_bytes)
        metrics = prediction_result.get("metrics", {})
        
        # 1. Fetch AI Analysis (Structured Template or Gemini)
        if prediction_result["confidence"] < 0.60:
             ai_analysis_result = {
                 "disease_name": "Unknown",
                 "severity": "Unknown",
                 "cause": "Low confidence. Please capture a clearer image of the plant leaf.",
                 "immediate_action": "Retake photo.",
                 "treatment_plan": [],
                 "prevention": "Ensure good lighting and focus.",
                 "estimated_crop_loss_risk": "Unknown",
                 "consult_expert": False
             }
        elif prediction_result["disease"].strip().lower() == "healthy":
             ai_analysis_result = {
                 "disease_name": "Healthy",
                 "severity": "None",
                 "cause": "The neural network indicates this plant is healthy.",
                 "immediate_action": "None",
                 "treatment_plan": [],
                 "prevention": "Continue current watering and fertilizing schedules. Monitor for future anomalies.",
                 "estimated_crop_loss_risk": "Low",
                 "consult_expert": False
             }
        else:
            ai_analysis_result = await get_ai_analysis(
                crop=prediction_result["crop"],
                disease=prediction_result["disease"],
                confidence=prediction_result["confidence"]
            )
            # Ensure it is a dict
            if isinstance(ai_analysis_result, dict) and "parse_error" in ai_analysis_result:
                 ai_analysis_result = {
                     "disease_name": prediction_result["disease"],
                     "severity": "Medium",
                     "cause": ai_analysis_result.get("raw_advice", "Failed to parse AI advice"),
                     "immediate_action": "Monitor plant closely.",
                     "treatment_plan": [],
                     "prevention": "Maintain optimal growing conditions.",
                     "estimated_crop_loss_risk": "Medium",
                     "consult_expert": True
                 }
        
        # 2. Decision Engine Calculations
        model_conf = prediction_result["confidence"]
        top_k = prediction_result.get("top_k", [])
        top_2_conf = top_k[1]["confidence"] if len(top_k) > 1 else model_conf
        confidence_gap = model_conf - top_2_conf
        
        lesion_density = metrics.get("lesion_density_percent", 0.0) / 100.0
        texture_complexity = metrics.get("texture_complexity", 0.0)
        
        # New Final Decision Score Formula
        final_decision_score = (model_conf * 0.6) + (confidence_gap * 0.1) + (lesion_density * 0.2) + (texture_complexity * 0.1)
        # Scale to 0-100
        final_decision_score = min(max(final_decision_score * 100.0, 0.0), 100.0)
        
        # Risk Index Calculation
        severity_factor = calculate_severity_factor(ai_analysis_result.get("severity", "Medium"))
        risk_index = model_conf * severity_factor * lesion_density * 100.0
        
        # Tier Assignment
        if final_decision_score > 85:
            tier = "Tier 1: High Confidence Diagnosis"
        elif final_decision_score > 65:
            tier = "Tier 2: Probable Diagnosis"
        else:
            tier = "Tier 3: Uncertain Diagnosis - Expert Review Advised"
            
        # Disease Progression
        if lesion_density > 0.4:
            progression = "Advanced Stage"
        elif lesion_density > 0.1:
            progression = "Mid Stage"
        elif lesion_density > 0.0:
            progression = "Early Stage"
        else:
            progression = "None"
            
        # Clean up expert fields if not expert_mode
        if not expert_mode:
             prediction_result["metrics"] = None
             
        # Mock Environmental Hook (If raining season -> +10 risk)
        # Assuming location data hook here.
        
        return DetectionResponse(
            scan_id=f"scan_{int(request.state.limiter._storage.storage.time() if hasattr(request.state.limiter._storage, 'storage') else 0)}", # Mock ID
            prediction=Prediction(**prediction_result),
            ai_analysis=AIAnalysis(**ai_analysis_result),
            final_decision_score=round(final_decision_score, 2),
            risk_index=round(risk_index, 2),
            tier=tier,
            disease_progression=progression
        )
        
    except HTTPException as he:
        raise he
    except ValueError as ve:
        return JSONResponse(status_code=400, content={"detail": str(ve)})
    except Exception as e:
        logger.error(f"Internal API Error: {e}")
        raise e

@router.post("/predict/batch", response_model=BatchDetectionResponse)
@limiter.limit("5/minute")
async def predict_disease_batch(request: Request, files: list[UploadFile] = File(...), expert_mode: bool = Query(False)):
    results = []
    total_risk = 0.0
    for file in files:
        # Re-use single predict logic (mocked up as a direct call for simplicity)
        res = await predict_disease(request, file, expert_mode)
        results.append(res)
        total_risk += res.risk_index if res.risk_index else 0.0
        
    avg_risk = total_risk / len(files) if files else 0.0
    directive = "Immediate field-wide action required." if avg_risk > 50 else "Monitor field conditions."
    
    import uuid
    return BatchDetectionResponse(
        batch_id=f"batch_{uuid.uuid4().hex[:8]}",
        results=results,
        overall_risk_index=round(avg_risk, 2),
        summary_directive=directive
    )

@router.get("/scan/history")
async def get_scan_history(request: Request):
    # Mocked History
    return {
        "scans": [
            {"scan_id": "scan_12345", "date": "2023-10-01", "disease": "Early Blight", "risk_index": 72.5, "trend": "worsening"},
            {"scan_id": "scan_12340", "date": "2023-09-25", "disease": "Early Blight", "risk_index": 45.0, "trend": "stable"}
        ]
    }

@router.get("/export/pdf/{scan_id}")
async def export_pdf_report(scan_id: str):
    # Mocked PDF Export Hook
    return JSONResponse(status_code=200, content={"message": f"PDF report generation for {scan_id} initiated. Download link will be ready shortly.", "url": f"/static/reports/{scan_id}.pdf"})

