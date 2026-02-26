# AgriVision AI Backend

AgriVision AI is a production-ready FastAPI backend for detecting plant diseases from images. It uses a CNN model (placeholder for MobileNetV2 architecture) for image prediction, and leverages Google's Gemini 1.5 Pro to provide reasoning, severity analysis, treatment, and prevention steps.

## System Flow
1. **POST** Image upload to `/predict`.
2. Image is preprocessed using OpenCV.
3. Model predicts the disease and crop confidence.
4. Gemini infers the summary, severity, treatment, and prevention from the prediction.
5. Returns a structured JSON response.

## Folder Structure
```
project_root/
├── app/
│   ├── __init__.py         # Package init
│   ├── config.py           # Configuration handler (Pydantic settings)
│   ├── main.py             # FastAPI entry point
│   ├── model_loader.py     # Loads the CNN model (MobileNetV2 structure)
│   ├── predictor.py        # Image preprocessing and model prediction logic
│   ├── gemini_client.py    # Integrates with Gemini API
│   └── prompts.py          # Structured Gemini prompt templates
├── models/
│   └── plant_disease_model.h5  # Place your pre-trained model here
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (Gemini API Key, Configs)
└── README.md
```

## Setup Instructions

### 1. Create a Virtual Environment
```bash
python -m venv venv

# On Windows:
venv\\Scripts\\activate
# On MacOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Configuration
Create a `.env` file in the root directory and add your keys:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
MODEL_PATH=models/plant_disease_model.h5
```

### 4. Setup CNN Model
Ensure you place your exported `.h5` model inside the `models/` folder. The loader logic in `app/model_loader.py` expects it to be at the path defined in your `MODEL_PATH` environment variable.

### 5. Start the Application
Run the FastAPI application via Uvicorn:
```bash
uvicorn app.main:app --reload
```
The API is served at: http://127.0.0.1:8000  
API Documentation (Swagger UI): http://127.0.0.1:8000/docs

## API Schema

**Endpoint:** `POST /predict`  
**Payload Type:** `multipart/form-data`  
**Field:** `file` (Image)

**Response Model:**
```json
{
  "prediction": {
    "crop": "Tomato",
    "disease": "Leaf Blight",
    "confidence": 0.85
  },
  "ai_analysis": {
    "summary": "Tomato Leaf Blight is a fungal disease causing premature leaf drop.",
    "severity": "High",
    "treatment_steps": [
      "Remove infected leaves immediately.",
      "Apply copper fungicide."
    ],
    "prevention_tips": [
      "Improve air circulation.",
      "Water the base of the plant, not the leaves."
    ]
  }
}
```
