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

async def get_ai_analysis(crop: str, disease: str, confidence: float) -> dict:
    if not settings.gemini_api_key or settings.gemini_api_key == "your_google_gemini_api_key_here":
        return _fallback_response("Gemini API key not configured.")

    prompt = f"""
    You are an expert agronomist.
    Only provide advice specific to the detected disease below. Do not speculate.

    - Crop: {crop}
    - Disease: {disease}
    - Confidence: {confidence:.2f}

    Please provide an analysis containing:
    1. A brief summary of the condition.
    2. The severity of the disease (Low, Medium, High, Critical).
    3. Step-by-step treatment instructions.
    4. Prevention tips for the future.

    Output STRICTLY as JSON:
    {{
      "summary": "string",
      "severity": "string",
      "treatment_steps": ["step 1", "step"],
      "prevention_tips": ["tip 1", "tip"]
    }}
    """
    
    try:
        response = await asyncio.wait_for(
            model.generate_content_async(
                prompt,
                generation_config={
                    "temperature": 0.0,
                    "top_p": 1.0,
                    "max_output_tokens": 300,
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
        except json.JSONDecodeError as e:
            logger.error(f"Gemini returned invalid JSON: {e} | Text: {raw_text}")
            return _fallback_response(
                f"Failed to parse AI structural response. Raw Output: {raw_text[:100]}..."
            )

    except asyncio.TimeoutError:
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
