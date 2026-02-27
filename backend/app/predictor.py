import json, os, logging
import cv2
import numpy as np

logger = logging.getLogger("leafsense")

CLASS_LABELS = [
    "Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy",
    "Blueberry___healthy","Cherry_(including_sour)___Powdery_mildew","Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight","Corn_(maize)___healthy","Grape___Black_rot",
    "Grape___Esca_(Black_Measles)","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy",
    "Pepper,_bell___Bacterial_spot","Pepper,_bell___healthy","Potato___Early_blight",
    "Potato___Late_blight","Potato___healthy","Raspberry___healthy","Soybean___healthy",
    "Squash___Powdery_mildew","Strawberry___Leaf_scorch","Strawberry___healthy",
    "Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight","Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot","Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato___Tomato_mosaic_virus","Tomato___healthy"
]

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image.")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if cv2.Laplacian(gray, cv2.CV_64F).var() < 80:
        raise ValueError("Image is too blurry. Please retake in better lighting.")
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(l)
    img = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32)
    img = (img / 127.5) - 1.0
    return np.expand_dims(img, axis=0)

def predict_image(image_bytes: bytes, model) -> dict:
    processed = preprocess_image(image_bytes)
    preds = model.predict(processed, verbose=0)[0]
    top3 = np.argsort(preds)[::-1][:3]
    top_predictions = []
    for rank, idx in enumerate(top3, 1):
        parts = CLASS_LABELS[idx].split("___") if idx < len(CLASS_LABELS) else [f"Class_{idx}", "Unknown"]
        crop = parts[0].replace("_", " ")
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        top_predictions.append({"rank": rank, "display_name": f"{crop} — {disease}", "crop": crop, "disease": disease, "confidence": round(float(preds[idx]), 4)})
    top1 = top_predictions[0]
    top2_conf = top_predictions[1]["confidence"] if len(top_predictions) > 1 else 0.0
    return {"crop": top1["crop"], "disease": top1["disease"], "confidence": top1["confidence"], "confidence_gap": round(top1["confidence"] - top2_conf, 4), "top_predictions": top_predictions}
