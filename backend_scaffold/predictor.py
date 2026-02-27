import cv2
import numpy as np

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image data.")
    # Resize to the input size of the CNN, e.g., 224x224
    img = cv2.resize(img, (224, 224))
    img = img / 255.0  # Normalize
    img = np.expand_dims(img, axis=0)
    return img

def predict_image(image_bytes: bytes, model) -> dict:
    try:
        processed_img = preprocess_image(image_bytes)
    except Exception as e:
         raise ValueError(f"Error during preprocessing: {e}")
    
    # Dummy prediction logic (In real app: preds = model.predict(processed_img))
    
    # Returning a static structured JSON response as specified in plan.md
    return {
        "crop": "Tomato",
        "disease": "Early blight",
        "confidence": 0.92
    }
