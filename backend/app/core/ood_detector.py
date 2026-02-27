import cv2
import numpy as np
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

def validate_plant_presence(image: np.ndarray) -> Tuple[bool, float, str, Dict[str, float]]:
    try:
        # 1. Resize for speed
        img_resized = cv2.resize(image, (256, 256))

        # A. Green Pixel Ratio
        hsv_image = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
        
        # Healthy green range
        lower_green = np.array([25, 40, 30])
        upper_green = np.array([95, 255, 255])
        mask1 = cv2.inRange(hsv_image, lower_green, upper_green)

        # Diseased/Brown range
        lower_brown = np.array([5, 40, 30])
        upper_brown = np.array([25, 255, 255])
        mask2 = cv2.inRange(hsv_image, lower_brown, upper_brown)

        combined_mask = cv2.bitwise_or(mask1, mask2)
        green_ratio = cv2.countNonZero(combined_mask) / (256 * 256)

        # B. Texture Entropy
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        hist, _ = np.histogram(gray.flatten(), bins=256, range=[0,256])
        hist_prob = hist / hist.sum()
        entropy = -np.sum(hist_prob * np.log2(hist_prob + 1e-7))

        # C. Edge Density
        edges = cv2.Canny(gray, 50, 150)
        edge_density = cv2.countNonZero(edges) / (256 * 256)

        scores = {
            "green_ratio": float(green_ratio),
            "entropy": float(entropy),
            "edge_density": float(edge_density)
        }

        failures = 0
        if green_ratio < 0.06:
            failures += 1
        if entropy < 3.2:
            failures += 1
        if edge_density < 0.01:
            failures += 1

        if failures >= 2:
            reasons = []
            if green_ratio < 0.06: reasons.append(f"Low plant color ({green_ratio*100:.1f}%)")
            if entropy < 3.2: reasons.append(f"Low texture ({entropy:.2f})")
            if edge_density < 0.01: reasons.append(f"Low edge detail ({edge_density*100:.1f}%)")
            
            rejection_reason = "Image failed safety checks: " + " and ".join(reasons)
            logger.warning(f"OOD Rejected: {rejection_reason}. Scores: {scores}")
            return False, 0.0, rejection_reason, scores

        return True, 1.0, "Pass", scores

    except Exception as e:
        logger.error(f"Error in plant validation: {e}")
        # Fail safe
        return False, 0.0, "Invalid image format during validation.", {"error": 1.0}
