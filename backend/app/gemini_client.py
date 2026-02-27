import asyncio, os, re, json, logging
import httpx

logger = logging.getLogger("leafsense")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def _strip_markdown(text: str) -> str:
    return re.sub(r"```(?:json)?|```", "", text).strip()

async def analyze_with_gemini(prediction: dict, language: str = "en") -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"advisory_valid": False, "parse_error": True, "error": "API key missing"}
    lang_names = {"en":"English","hi":"Hindi","mr":"Marathi","te":"Telugu","ta":"Tamil","kn":"Kannada","bn":"Bengali","pa":"Punjabi"}
    lang_name = lang_names.get(language, "English")
    crop, disease, conf = prediction.get("crop","Unknown"), prediction.get("disease","Unknown"), round(prediction.get("confidence",0)*100,1)
    prompt = f"""You are an expert plant pathologist. DETECTED: {crop} with {disease} at {conf}% confidence.
INSTRUCTIONS: Respond ONLY about {disease} on {crop}. No disclaimers. Output ONLY valid JSON in {lang_name}. Keep all JSON keys in English.
REQUIRED JSON:
{{"disease_name":"string","severity":"Low|Medium|High|Critical","cause":"string","immediate_action":"string","treatment_plan":["step1","step2","step3"],"prevention":"string","estimated_crop_loss_risk":"Low|Medium|High","consult_expert":true}}"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{GEMINI_URL}?key={api_key}", json={"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":0,"maxOutputTokens":600}}, headers={"Content-Type":"application/json"})
            resp.raise_for_status()
            raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except httpx.TimeoutException:
        return {"advisory_valid": False, "error": "GEMINI_TIMEOUT"}
    except Exception as e:
        return {"advisory_valid": False, "error": str(e)}
    try:
        parsed = json.loads(_strip_markdown(raw))
        required = ["disease_name","severity","cause","immediate_action","treatment_plan","prevention","estimated_crop_loss_risk","consult_expert"]
        parsed["advisory_valid"] = all(k in parsed for k in required)
        return parsed
    except json.JSONDecodeError:
        return {"advisory_valid": False, "parse_error": True, "raw_advice": raw}
