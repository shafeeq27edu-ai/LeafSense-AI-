import logging
from dataclasses import dataclass
from typing import Optional
import cv2
import numpy as np
from scipy.stats import entropy as scipy_entropy

logger = logging.getLogger("leafsense")

@dataclass
class ValidationResult:
    is_plant: bool
    rejection_reason: Optional[str]
    green_ratio: float
    entropy: float
    edge_density: float
    confidence: float

def validate_plant_presence(image_bytes: bytes) -> ValidationResult:
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return ValidationResult(is_plant=False, rejection_reason="Invalid image format.", green_ratio=0.0, entropy=0.0, edge_density=0.0, confidence=0.0)
        img = cv2.resize(img, (256, 256))
        total_pixels = 256 * 256
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        green_mask = cv2.inRange(hsv, (25, 40, 30), (95, 255, 255))
        brown_mask = cv2.inRange(hsv, (5, 40, 30), (25, 255, 255))
        plant_pixels = cv2.countNonZero(green_mask) + cv2.countNonZero(brown_mask)
        green_ratio = round(plant_pixels / total_pixels, 4)
        check_a = green_ratio >= 0.06
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
        hist_norm = hist / hist.sum()
        hist_norm = hist_norm[hist_norm > 0]
        texture_entropy = round(float(scipy_entropy(hist_norm, base=2)), 4)
        check_b = texture_entropy >= 3.2
        edges = cv2.Canny(gray, 50, 150)
        edge_density = round(cv2.countNonZero(edges) / total_pixels, 4)
        check_c = edge_density >= 0.01
        checks_passed = sum([check_a, check_b, check_c])
        is_plant = checks_passed >= 2
        confidence = round(checks_passed / 3, 4)
        rejection_reason = None
        if not is_plant:
            failed = []
            if not check_a: failed.append(f"insufficient plant pixels ({green_ratio:.1%})")
            if not check_b: failed.append(f"low texture complexity ({texture_entropy:.1f})")
            if not check_c: failed.append(f"insufficient leaf structure ({edge_density:.1%})")
            rejection_reason = "Image does not appear to be a plant leaf. Failed: " + ", ".join(failed) + ". Please upload a clear leaf photo."
        return ValidationResult(is_plant=is_plant, rejection_reason=rejection_reason, green_ratio=green_ratio, entropy=texture_entropy, edge_density=edge_density, confidence=confidence)
    except Exception as e:
        return ValidationResult(is_plant=False, rejection_reason="Validation error. Please try again.", green_ratio=0.0, entropy=0.0, edge_density=0.0, confidence=0.0)
