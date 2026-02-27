import asyncio
import numpy as np
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
import tensorflow as tf
from app.core.model_loader import cnn_model, CLASS_LABELS, feature_extractor, class_centroids, TEMPERATURE_CALIBRATION
from app.core.predictor import preprocess_image

inference_lock = asyncio.Semaphore(1)

async def acquire_slot(timeout=12):
    try:
        await asyncio.wait_for(inference_lock.acquire(), timeout)
        return True
    except asyncio.TimeoutError:
        return False

def apply_tta(image_tensor: np.ndarray) -> np.ndarray:
    """Applies basic Test-Time Augmentation: Original, Flipped, Brightness Shift."""
    flipped = np.fliplr(image_tensor[0])
    flipped_tensor = np.expand_dims(flipped, axis=0)
    
    # Slight brightness shift (simulate by adding a small constant, since it's preprocessed, be careful)
    # MobileNetV2 preprocess maps to [-1, 1], so we shift slightly
    bright = np.clip(image_tensor + 0.1, -1.0, 1.0)
    
    return np.vstack([image_tensor, flipped_tensor, bright])

def calibrate_confidence(probs: np.ndarray, temperature: float) -> np.ndarray:
    """Applies temperature scaling to soften or sharpen probabilities."""
    # Convert back to logits (approximate) to apply temperature
    epsilon = 1e-7
    logits = np.log(probs + epsilon)
    scaled_logits = logits / temperature
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits)) # numerical stability
    return exp_logits / np.sum(exp_logits)

async def _run_inference_safely(image_bytes: bytes) -> dict:
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    tensor_input, metrics = preprocess_image(image_bytes)
    
    # Generate TTA batch
    tta_batch = apply_tta(tensor_input)
        
    slot_acquired = await acquire_slot()
    if not slot_acquired:
        raise HTTPException(
            status_code=503, 
            detail={"detail": "Server under high demand. Please retry.", "code": "SERVER_BUSY"}
        )

    try:
        # Run prediction on the batch
        prediction_probs_batch = await run_in_threadpool(cnn_model.predict, tta_batch, verbose=0)
        # Extract features for similarity scoring (only on original image)
        features = await run_in_threadpool(feature_extractor.predict, tensor_input, verbose=0)
    finally:
        inference_lock.release()
        
    # Average TTA predictions
    avg_probs = np.mean(prediction_probs_batch, axis=0)
    
    # Temperature Scaling Calibration
    calibrated_probs = calibrate_confidence(avg_probs, TEMPERATURE_CALIBRATION)
    
    top_3_indices = np.argsort(calibrated_probs)[-3:][::-1]
    
    top_k = []
    for idx in top_3_indices:
        lbl = CLASS_LABELS.get(str(idx)) or CLASS_LABELS.get(idx) or f"Unknown_{idx}"
        top_k.append({
            "label": lbl.replace("___", " - ").replace("_", " "),
            "confidence": float(calibrated_probs[idx])
        })
        
    class_idx = int(top_3_indices[0])
    base_confidence = float(calibrated_probs[class_idx])
    
    # Similarity-based Confidence Adjustment
    feature_vector = features[0]
    feature_vector = feature_vector / (np.linalg.norm(feature_vector) + 1e-7)
    centroid = class_centroids[class_idx]
    
    # Cosine distance
    similarity = np.dot(feature_vector, centroid)
    distance = 1.0 - similarity
    
    # Adjust confidence downward if distance is high (threshold 0.5)
    if distance > 0.5:
        adjusted_confidence = base_confidence * 0.8 # Penalty
    else:
        adjusted_confidence = base_confidence

    metrics["feature_distance"] = round(float(distance), 4)

    disease_name = CLASS_LABELS.get(str(class_idx)) or CLASS_LABELS.get(class_idx)
    if not disease_name:
         raise RuntimeError(f"Index {class_idx} not found in CLASS_LABELS lookup.")
         
    parts = disease_name.split("___")
    if len(parts) == 2:
        crop = parts[0].replace("_", " ")
        disease = parts[1].replace("_", " ")
    else:
        crop = "Unknown Crop Type"
        disease = disease_name.replace("_", " ")

    return {
        "crop": crop,
        "disease": disease,
        "confidence": adjusted_confidence,
        "top_k": top_k,
        "metrics": metrics
    }
