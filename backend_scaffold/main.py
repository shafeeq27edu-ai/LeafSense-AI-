import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from .model_loader import load_model, get_model
from .predictor import predict_image
from .gemini_client import analyze_with_gemini

app = FastAPI(title="Plant Disease Detection API", version="1.0")

@app.on_event("startup")
async def startup_event():
    load_model("disease_model.h5")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    # Read image
    contents = await file.read()
    
    # Predict using CNN
    prediction = predict_image(contents, get_model())
    
    # Analyze with Gemini
    ai_analysis = await analyze_with_gemini(prediction)
    
    return {
        "prediction": prediction,
        "ai_analysis": ai_analysis
    }
