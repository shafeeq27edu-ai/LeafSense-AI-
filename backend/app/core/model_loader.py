import os
import json
import logging
import tensorflow as tf
import numpy as np
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
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train or download the model.")
    logger.info(f"Loading real model from {model_path}...")
    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        logger.error(f"Error loading model from {model_path}: {e}")
        raise RuntimeError(f"Failed to load model from {model_path}: {e}")

    output_shape = model.output_shape
    num_classes = output_shape[-1]
    logger.info(f"Model output classes: {num_classes}")
    
    if num_classes != expected_num_classes:
         raise RuntimeError(f"FATAL: Model output shape ({num_classes}) does not match the number of provided class labels ({expected_num_classes}).")
    logger.info("Model validation successful.")
    return model

def create_feature_extractor(base_model):
    # Create a sub-model that outputs the embeddings from the penultimate layer
    # For MobileNetV2, the layer before the final dense projection is usually a GlobalAveragePooling2D
    # Let's find the correct layer
    penultimate_layer = base_model.layers[-2]
    return tf.keras.Model(inputs=base_model.input, outputs=penultimate_layer.output)

def initialize_dummy_centroids(num_classes: int, embedding_dim: int) -> np.ndarray:
    logger.warning("Initializing dummy centroids for feature similarity scoring. In a real scenario, calculate these on the training set.")
    # Initialize random unit vectors distributed around the sphere
    centroids = np.random.randn(num_classes, embedding_dim)
    centroids = centroids / np.linalg.norm(centroids, axis=1, keepdims=True)
    return centroids.astype(np.float32)

LABEL_FILE = getattr(settings, 'labels_path', 'models/class_labels.json')

_health_state = {
    "loaded": False,
    "warmup_passed": False,
    "runtime": "tensorflow"
}

def get_health_status():
    return _health_state

try:
    CLASS_LABELS = load_class_labels(LABEL_FILE)
    cnn_model = load_and_validate_model(settings.model_path, len(CLASS_LABELS))
    # Extract feature model
    feature_extractor = create_feature_extractor(cnn_model)
    embedding_dim = feature_extractor.output_shape[-1]
    class_centroids = initialize_dummy_centroids(len(CLASS_LABELS), embedding_dim)
    # Temperature scaling parameter
    TEMPERATURE_CALIBRATION = 1.5
    
    _health_state["loaded"] = True
    
    # Warmup
    try:
        dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
        cnn_model.predict(dummy_input, verbose=0)
        feature_extractor.predict(dummy_input, verbose=0)
        _health_state["warmup_passed"] = True
        logger.info("Model warmup sequence completed successfully.")
    except Exception as e:
        logger.error(f"Model warmup failed: {e}")
        _health_state["warmup_passed"] = False

except FileNotFoundError as fnf_error:
    logger.critical(f"Startup Failure (Missing File): {fnf_error}")
    raise SystemExit(str(fnf_error))
except Exception as startup_error:
    logger.critical(f"Startup Validation Failed: {startup_error}")
    raise SystemExit(f"Initialization Error: {startup_error}")
