import os
import json
import logging
import tensorflow as tf
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def load_class_labels(labels_path: str) -> dict:
    if not os.path.exists(labels_path):
        raise FileNotFoundError(f"Class labels not found at {labels_path}")
        
    with open(labels_path, 'r') as f:
        labels = json.load(f)
        
    logger.info(f"Loaded {len(labels)} class labels from {labels_path}")
    return labels

def load_and_validate_model(model_path: str, expected_num_classes: int):
    """
    Loads the real pre-trained CNN model and validates output shape against labels.
    Ensures model loads only once at startup and fails fast if missing.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train or download the model.")

    logger.info(f"Loading real model from {model_path}...")
    
    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {e}")
        raise RuntimeError(f"Failed to load model from {model_path}: {e}")

    # Validate output shape
    output_shape = model.output_shape
    num_classes = output_shape[-1]
    
    logger.info(f"Model output classes: {num_classes}")
    
    if num_classes != expected_num_classes:
         raise RuntimeError(
             f"FATAL: Model output shape ({num_classes}) does not match "
             f"the number of provided class labels ({expected_num_classes})."
         )
         
    logger.info("Model validation successful.")
    return model

# Global loading & Explicit Startup Validation
LABEL_FILE = getattr(settings, 'labels_path', 'models/class_labels.json')

try:
    CLASS_LABELS = load_class_labels(LABEL_FILE)
    cnn_model = load_and_validate_model(settings.model_path, len(CLASS_LABELS))
except FileNotFoundError as fnf_error:
    logger.critical(f"Startup Failure (Missing File): {fnf_error}")
    raise SystemExit(str(fnf_error))
except Exception as startup_error:
    logger.critical(f"Startup Validation Failed: {startup_error}")
    raise SystemExit(f"Initialization Error: {startup_error}")
