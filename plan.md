LAYER 1 — ROLE / CONTEXT

You are a senior AI systems architect and full-stack ML engineer.
You are building a production-ready AI-based Plant Disease Detection system.

The goal is to generate a fully structured, clean, modular backend project using:

- Python
- FastAPI
- Pre-trained CNN model (.h5 format placeholder)
- Gemini 3.1 Pro API integration
- REST API design
- Clean architecture principles

The output must scaffold at least 50% of the working backend system.


LAYER 2 — TASK / OBJECTIVE

Generate a complete backend architecture that includes:

1. Folder structure
2. FastAPI app initialization
3. Image upload endpoint
4. Image preprocessing pipeline using OpenCV
5. Model loading function (load_model)
6. Prediction function returning structured JSON:
   {
     "crop": string,
     "disease": string,
     "confidence": float
   }
7. Gemini reasoning integration module
8. Structured Gemini prompt template
9. Gemini API call function
10. Final response format:
   {
     "prediction": {...},
     "ai_analysis": {
        "summary": string,
        "treatment_steps": [string],
        "prevention_tips": [string]
     }
   }
11. requirements.txt
12. Clear instructions to run the server


LAYER 3 — CONSTRAINTS / OUTPUT FORMAT

- Use clean modular architecture.
- Separate files for:
  - main.py
  - model_loader.py
  - predictor.py
  - gemini_client.py
  - prompts.py
- Use environment variables for Gemini API key.
- Use async FastAPI endpoints.
- Use type hints.
- Include proper error handling.
- Keep code beginner-friendly but production-structured.
- Do NOT include unnecessary explanation.
- Output code in clearly separated file blocks.
- Ensure everything is runnable with minimal edits.