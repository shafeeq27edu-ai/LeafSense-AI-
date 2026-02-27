import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from .prompts import build_disease_analysis_prompt

load_dotenv()

# Configure API Key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

async def analyze_with_gemini(prediction_data: dict) -> dict:
    try:
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        model = genai.GenerativeModel("gemini-1.5-pro-latest")  # Using 1.5-pro as fallback for 3.1
        prompt = build_disease_analysis_prompt(
            crop=prediction_data.get("crop", "Unknown"),
            disease=prediction_data.get("disease", "Unknown"),
            confidence=prediction_data.get("confidence", 0.0)
        )
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up possible markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "", 1)
        if response_text.endswith("```"):
            response_text = response_text[::-1].replace("```"[::-1], "", 1)[::-1]
            
        ai_analysis = json.loads(response_text)
        return ai_analysis
    except Exception as e:
        # Fallback if Gemini fails or key is missing
        print(f"Gemini API Error: {e}")
        return {
            "summary": "AI analysis is currently unavailable.",
            "treatment_steps": ["Consult a local agricultural expert.", "Remove affected leaves immediately.", "Apply appropriate fungicide."],
            "prevention_tips": ["Ensure proper spacing for airflow.", "Avoid overhead watering.", "Practice crop rotation."]
        }
