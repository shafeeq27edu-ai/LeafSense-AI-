import cv2
import numpy as np
import logging
import tensorflow as tf
from app.model_loader import cnn_model, CLASS_LABELS

logger = logging.getLogger(__name__)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Decodes the uploaded image and applies EXACT MobileNetV2 preprocessing.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Invalid or corrupted image file.")
        
    # Resize to expected input size for MobileNetV2 (setup exactly 224x224)
    image_resized = cv2.resize(image, (224, 224))
    
    # Convert BGR (OpenCV default) to RGB (Model expectations)
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    
    # Preprocess using exact MobileNetV2 built-in function (scaling to [-1, 1])
    # IMPORTANT: Do not manually divide by 255.
    image_float = np.array(image_rgb, dtype=np.float32)
    image_normalized = tf.keras.applications.mobilenet_v2.preprocess_input(image_float)
    
    # Add batch dimension -> (1, 224, 224, 3)
    image_batch = np.expand_dims(image_normalized, axis=0)
    
    return image_batch

async def predict_disease_from_image(image_bytes: bytes) -> dict:
    """
    Preprocesses the image, runs it through the real CNN model, and returns a structured prediction.
    """
    if cnn_model is None:
         raise RuntimeError("ML Model is not loaded on the server.")
         
    try:
        processed_image = preprocess_image(image_bytes)
    except ValueError as e:
        # Re-raise standard value errors for main.py to catch and return 400
        raise e
        
    try:
        # Inference using the loaded, validated model
        prediction_probs = cnn_model.predict(processed_image)
        class_idx = int(np.argmax(prediction_probs[0]))
        confidence = float(prediction_probs[0][class_idx])
        
        # Map prediction index securely to the strictly loaded JSON labels
        # Handle cases where json keys are either string or ints
        disease_name = CLASS_LABELS.get(str(class_idx)) or CLASS_LABELS.get(class_idx)
        
        if not disease_name:
             raise RuntimeError(f"Index {class_idx} not found in CLASS_LABELS lookup.")
             
        # Parse crop and disease intelligently if format is like "Crop___Disease"
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
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"Error during prediction logic: {e}")
        raise RuntimeError(f"Failed to process image and predict disease: {e}")
