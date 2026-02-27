import logging, os

logger = logging.getLogger("leafsense")
_model = None
_model_healthy = False
_model_runtime = "none"

def load_model(model_path: str):
    global _model, _model_healthy, _model_runtime
    if not os.path.exists(model_path):
        logger.error(f"Model not found: {model_path}")
        return
    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(model_path)
        _model_runtime = "tensorflow"
        _model_healthy = True
        logger.info(f"Model loaded: {model_path}")
    except Exception as e:
        logger.error(f"Model load failed: {e}")

def get_model(): return _model
def is_model_healthy(): return _model_healthy
def get_model_runtime(): return _model_runtime
