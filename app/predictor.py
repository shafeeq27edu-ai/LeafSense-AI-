import cv2
import numpy as np
import logging
import tensorflow as tf
from app.model_loader import cnn_model, CLASS_LABELS

logger = logging.getLogger(__name__)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Invalid or corrupted image file.")
        
    # OOD Heuristic: Plant Detection via HSV Green Mask
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    # Define broad green range in HSV
    lower_green = np.array([25, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    mask = cv2.inRange(hsv_image, lower_green, upper_green)
    green_ratio = cv2.countNonZero(mask) / (image.shape[0] * image.shape[1])
    
    # If less than 2% of the image contains green hues, mathematically reject as OOD
    if green_ratio < 0.02:
        logger.warning(f"OOD Rejected: Image contains only {green_ratio*100:.1f}% green pixels.")
        raise ValueError("No plant detected in image.")
        
    image_resized = cv2.resize(image, (224, 224))
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    
    image_float = np.array(image_rgb, dtype=np.float32)
    image_normalized = tf.keras.applications.mobilenet_v2.preprocess_input(image_float)
    image_batch = np.expand_dims(image_normalized, axis=0)
    
    return image_batch

async def predict_disease_from_image(image_bytes: bytes) -> dict:
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    processed_image = preprocess_image(image_bytes)
        
    prediction_probs = cnn_model.predict(processed_image)
    
    # Extract top 3 probabilities
    probs_array = prediction_probs[0]
    top_3_indices = np.argsort(probs_array)[-3:][::-1]
    
    top_k = []
    for idx in top_3_indices:
        lbl = CLASS_LABELS.get(str(idx)) or CLASS_LABELS.get(idx) or f"Unknown_{idx}"
        top_k.append({
            "label": lbl.replace("___", " - ").replace("_", " "),
            "confidence": float(probs_array[idx])
        })
        
    class_idx = int(top_3_indices[0])
    confidence = float(probs_array[class_idx])
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
        "confidence": confidence,
        "top_k": top_k
    }
