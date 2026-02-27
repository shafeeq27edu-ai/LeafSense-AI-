import json
import logging
import asyncio
import google.generativeai as genai
import re
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

if settings.gemini_api_key and settings.gemini_api_key != "your_google_gemini_api_key_here":
    genai.configure(api_key=settings.gemini_api_key)

model = genai.GenerativeModel('gemini-1.5-flash-latest')

# Crop-Specific Advisory Templates Cache
ADVISORY_TEMPLATES = {
    "Tomato Early Blight": {
        "disease_name": "Early Blight (Alternaria solani)",
        "severity": "High",
        "cause": "Fungal infection thriving in warm, humid conditions.",
        "immediate_action": "Remove and destroy infected leaves immediately. Do not compost.",
        "treatment_plan": [
            "Apply copper-based fungicide or chlorothalonil to prevent spread.",
            "Prune lower leaves to improve air circulation.",
            "Water at the base of the plant to keep leaves dry."
        ],
        "prevention": "Rotate crops annually. Use drip irrigation. Mulch at the base.",
        "estimated_crop_loss_risk": "High",
        "consult_expert": True
    },
    "Apple Scab": {
        "disease_name": "Apple Scab (Venturia inaequalis)",
        "severity": "Medium",
        "cause": "Ascomycete fungus heavily dependent on spring moisture.",
        "immediate_action": "Rake and destroy fallen leaves to reduce overwintering spores.",
        "treatment_plan": [
            "Apply preventive fungicides before rainfall in spring.",
            "Prune trees to open the canopy for better airflow and faster drying."
        ],
        "prevention": "Plant scab-resistant apple varieties. Maintain orchard sanitation.",
        "estimated_crop_loss_risk": "Medium",
        "consult_expert": False
    },
    "Corn Common Rust": {
         "disease_name": "Common Rust (Puccinia sorghi)",
         "severity": "Medium",
         "cause": "Fungal pathogen favored by cool, moist conditions.",
         "immediate_action": "Monitor surrounding corn for rapid rust development.",
         "treatment_plan": [
             "In severe early outbreaks, fungicide application may be warranted.",
             "Often, late-season rust does not require treatment as yield impact is low."
         ],
         "prevention": "Plant rust-resistant corn hybrids.",
         "estimated_crop_loss_risk": "Low",
         "consult_expert": False
    }
}

async def get_ai_analysis(crop: str, disease: str, confidence: float) -> dict:
    if "healthy" in disease.lower():
        return {
            "disease_name": "None",
            "severity": "Low",
            "cause": "The plant appears healthy.",
            "immediate_action": "None",
            "treatment_plan": [],
            "prevention": "Continue standard care routines.",
            "estimated_crop_loss_risk": "Low",
            "consult_expert": False
        }

    # 1. Check Advisory Template Cache (Differentiation feature)
    template_key = f"{crop} {disease}".strip()
    if template_key in ADVISORY_TEMPLATES:
        logger.info(f"Using structured template for {template_key}")
        return ADVISORY_TEMPLATES[template_key]
        
    # If not in cache but we have a matching general term
    for key, template in ADVISORY_TEMPLATES.items():
        if disease.lower() in key.lower():
             logger.info(f"Using partial match structured template for {disease}")
             return template

    # 2. Fallback to Gemini LLM
    if not settings.gemini_api_key or settings.gemini_api_key == "your_google_gemini_api_key_here":
        return _fallback_response(f"Template not found and Gemini API key not configured for {crop} {disease}.")

    prompt = f"""
    - Detected Crop: {crop}
    - Detected Disease: {disease}
    - Neural Network Confidence: {confidence*100:.1f}%

    Respond ONLY about this disease.
    Do NOT speculate.
    Do NOT include disclaimers.
    Output ONLY JSON matching this exact schema:

    {{
      "disease_name": "string",
      "severity": "Low | Medium | High | Critical",
      "cause": "string",
      "immediate_action": "string",
      "treatment_plan": ["step 1", "step 2"],
      "prevention": "string",
      "estimated_crop_loss_risk": "Low | Medium | High",
      "consult_expert": boolean
    }}
    """
    
    try:
        response = await asyncio.wait_for(
            model.generate_content_async(
                prompt,
                generation_config={
                    "temperature": 0.0,
                    "top_p": 1.0,
                    "max_output_tokens": 500,
                }
            ),
            timeout=8.0
        )
        
        raw_text = response.text.strip()
        
        # Defensive Stripping of potential markdown fences
        raw_text = re.sub(r'^```json', '', raw_text, flags=re.IGNORECASE)
        raw_text = re.sub(r'^```', '', raw_text)
        raw_text = re.sub(r'```$', '', raw_text)
        raw_text = raw_text.strip()

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError:
            return {
                "raw_advice": raw_text,
                "parse_error": True
            }

    except asyncio.TimeoutError:
        return _fallback_response("AI advisory timed out computing treatment protocol.")
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return _fallback_response("Failed to generate AI analysis due to an internal error.")

def _fallback_response(msg: str, severity: str = "Unknown") -> dict:
    return {
        "disease_name": "Unknown",
        "severity": severity,
        "cause": msg,
        "immediate_action": "Monitor plant closely.",
        "treatment_plan": [],
        "prevention": "Maintain optimal growing conditions.",
        "estimated_crop_loss_risk": "Medium",
        "consult_expert": True
    }
