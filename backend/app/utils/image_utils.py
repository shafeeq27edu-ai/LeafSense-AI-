import cv2
import numpy as np
import tensorflow as tf
from typing import Tuple, Dict, Any

def decode_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Invalid or corrupted image file.")
    return image

def compute_blur_score(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def enhance_image_pipeline(image: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
    # 1. Blur Detection
    blur_score = compute_blur_score(image)
    
    # 2. White Balance Normalization (Simple Grey-World)
    result_wb = image.copy()
    avg_b = np.average(result_wb[:, :, 0])
    avg_g = np.average(result_wb[:, :, 1])
    avg_r = np.average(result_wb[:, :, 2])
    avg = (avg_b + avg_g + avg_r) / 3
    result_wb[:, :, 0] = np.clip(result_wb[:, :, 0] * (avg / avg_b), 0, 255)
    result_wb[:, :, 1] = np.clip(result_wb[:, :, 1] * (avg / avg_g), 0, 255)
    result_wb[:, :, 2] = np.clip(result_wb[:, :, 2] * (avg / avg_r), 0, 255)
    result_wb = result_wb.astype(np.uint8)

    # 3. CLAHE on Luminance Channel
    lab = cv2.cvtColor(result_wb, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    # 4. Background Suppression (Color Masking)
    hsv = cv2.cvtColor(enhanced_img, cv2.COLOR_BGR2HSV)
    # Define broad plant color range (yellowish-green to dark green)
    lower_plant = np.array([25, 40, 40])
    upper_plant = np.array([95, 255, 255])
    # Also include brown/diseased areas
    lower_brown = np.array([5, 40, 40])
    upper_brown = np.array([25, 255, 255])
    
    mask_green = cv2.inRange(hsv, lower_plant, upper_plant)
    mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)
    plant_mask = cv2.bitwise_or(mask_green, mask_brown)
    
    # Clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    plant_mask = cv2.morphologyEx(plant_mask, cv2.MORPH_CLOSE, kernel)
    
    # Apply mask
    foreground = cv2.bitwise_and(enhanced_img, enhanced_img, mask=plant_mask)

    # 5. Adaptive Sharpening (Unsharp Masking)
    gaussian = cv2.GaussianBlur(foreground, (0, 0), 2.0)
    sharpened = cv2.addWeighted(foreground, 1.5, gaussian, -0.5, 0)
    
    # --- Image Analysis (Part D) ---
    metrics = {
        "blur_score": round(blur_score, 2)
    }
    
    # Lesion Density & Disease Progression (Brown Spots)
    total_plant_pixels = cv2.countNonZero(plant_mask)
    if total_plant_pixels > 0:
        brown_pixels = cv2.countNonZero(mask_brown)
        metrics["lesion_density_percent"] = round((brown_pixels / total_plant_pixels) * 100, 2)
    else:
        metrics["lesion_density_percent"] = 0.0

    # Dominant Color
    if total_plant_pixels > 0:
        mean_val = cv2.mean(enhanced_img, mask=plant_mask)
        metrics["dominant_color"] = f"RGB({int(mean_val[2])},{int(mean_val[1])},{int(mean_val[0])})"
    else:
        metrics["dominant_color"] = "Unknown"

    # Texture Complexity & Edge Roughness
    gray = cv2.cvtColor(sharpened, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = cv2.countNonZero(edges) / (sharpened.shape[0] * sharpened.shape[1])
    metrics["texture_complexity"] = round(edge_density, 4)

    return sharpened, metrics

def resize_and_normalize(image: np.ndarray) -> np.ndarray:
    image_resized = cv2.resize(image, (224, 224))
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    image_float = np.array(image_rgb, dtype=np.float32)
    image_normalized = tf.keras.applications.mobilenet_v2.preprocess_input(image_float)
    return np.expand_dims(image_normalized, axis=0)
