from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIAnalysis(BaseModel):
    disease_name: str
    severity: str
    cause: str
    immediate_action: str
    treatment_plan: List[str]
    prevention: str
    estimated_crop_loss_risk: str
    consult_expert: bool

class TopKPrediction(BaseModel):
    label: str
    confidence: float

class Prediction(BaseModel):
    crop: str
    disease: str
    confidence: float
    top_k: Optional[List[TopKPrediction]] = None
    metrics: Optional[Dict[str, Any]] = None

class DetectionResponse(BaseModel):
    scan_id: Optional[str] = None
    prediction: Prediction
    ai_analysis: AIAnalysis
    final_decision_score: Optional[float] = None
    risk_index: Optional[float] = None
    tier: Optional[str] = None
    disease_progression: Optional[str] = None

class BatchDetectionResponse(BaseModel):
    batch_id: str
    results: List[DetectionResponse]
    overall_risk_index: float
    summary_directive: str
