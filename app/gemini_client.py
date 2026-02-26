import json
import logging
import asyncio
import google.generativeai as genai
from app.prompts import DISEASE_ANALYSIS_PROMPT
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

if settings.gemini_api_key and settings.gemini_api_key != "your_google_gemini_api_key_here":
    genai.configure(api_key=settings.gemini_api_key)

# Use Gemini Flash for lower latency and strict JSON outputs
model = genai.GenerativeModel('gemini-1.5-flash-latest')

async def get_ai_analysis(crop: str, disease: str, confidence: float) -> dict:
    """
    Calls Gemini API deterministically with an 8-second hard timeout.
    Returns safe fallback if API hangs, fails, or hallucinates bad JSON.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "your_google_gemini_api_key_here":
        logger.warning("Gemini API key is not configured.")
        return _fallback_response("Gemini API key not configured.")

    if confidence < 0.60 or disease.lower() == "healthy":
        return _fallback_response(
            "Plant appears healthy or confidence is too low. No treatment required.",
            severity="None"
        )
         
    prompt = f"""
    You are an expert plant pathologist and agronomist.
    Only provide advice specific to the detected disease below. Do not speculate.

    - Crop: {crop}
    - Disease: {disease}
    - Confidence: {confidence:.2f}

    Please provide an analysis containing:
    1. A brief summary of the condition.
    2. The severity of the disease (e.g. Low, Medium, High, Critical).
    3. Step-by-step treatment instructions.
    4. Prevention tips for the future.

    Output your response STRICTLY as a JSON object with the following structure:
    {{
      "summary": "string",
      "severity": "string",
      "treatment_steps": ["step 1", "step 2"],
      "prevention_tips": ["tip 1", "tip 2"]
    }}
    """
    
    try:
        # Wrap Gemini call in an 8-second asyncio timeout
        response = await asyncio.wait_for(
            model.generate_content_async(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.0,
                    "top_p": 1.0,
                    "max_output_tokens": 300,
                }
            ),
            timeout=8.0
        )
        
        # Defensive JSON parsing
        try:
            return json.loads(response.text)
        except json.JSONDecodeError as e:
            logger.error(f"Gemini returned invalid JSON: {e} | Text: {response.text}")
            return _fallback_response("Failed to parse AI response structurally.")

    except asyncio.TimeoutError:
        logger.error("Gemini API call exceeded 8-second timeout.")
        return _fallback_response("AI advisory timed out computing treatment protocol.")
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return _fallback_response("Failed to generate AI analysis due to an internal error.")

def _fallback_response(msg: str, severity: str = "Unknown") -> dict:
    return {
        "summary": msg,
        "severity": severity,
        "treatment_steps": [],
        "prevention_tips": []
    }
