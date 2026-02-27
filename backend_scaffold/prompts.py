def build_disease_analysis_prompt(crop: str, disease: str, confidence: float) -> str:
    return f"""
You are an expert plant pathologist and AI assistant.
A computer vision model has detected disease with the following details:
- Crop: {crop}
- Disease: {disease}
- Confidence: {confidence * 100:.2f}%

Please provide a structured analysis including a short summary, a list of treatment steps, and a list of prevention tips.
Return ONLY a strictly valid JSON object in the following format, with no markdown formatting or extra text:
{{
    "summary": "Brief explanation of the disease and its impact.",
    "treatment_steps": ["step 1", "step 2", "step 3"],
    "prevention_tips": ["tip 1", "tip 2", "tip 3"]
}}
"""
