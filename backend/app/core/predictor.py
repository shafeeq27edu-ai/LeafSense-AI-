from fastapi import HTTPException
from app.core.ood_detector import validate_plant_presence
from app.utils.image_utils import decode_image, enhance_image_pipeline, resize_and_normalize
from typing import Tuple, Dict, Any
import numpy as np

def preprocess_image(image_bytes: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
    # 1. Decode bytes to numpy array
    image = decode_image(image_bytes)
    
    # 2. OOD Validation
    is_plant, confidence, reason, scores = validate_plant_presence(image)
    if not is_plant:
        raise HTTPException(
            status_code=422,
            detail={
                "detail": reason,
                "code": "NOT_A_PLANT",
                "validator_scores": scores
            }
        )

    # 3. Enhance Image and Extract Metrics
    enhanced_image, metrics = enhance_image_pipeline(image)
    
    # 4. Blur Reject
    if metrics["blur_score"] < 50.0:  # Threshold for Laplacian variance
         raise HTTPException(
            status_code=422,
            detail={
                "detail": "Image too blurry. Please retake.",
                "code": "IMAGE_TOO_BLURRY",
                "validator_scores": metrics
            }
        )

    # 5. Format for MobileNetV2
    tensor_input = resize_and_normalize(enhanced_image)
    
    return tensor_input, metrics
