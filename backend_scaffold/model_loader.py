import os

# Placeholder for loaded model
_model = None

def load_model(model_path: str):
    global _model
    # In a real scenario, this would load a real model:
    # from tensorflow.keras.models import load_model as keras_load_model
    # _model = keras_load_model(model_path)
    print(f"Loading model from {model_path}...")
    _model = "DummyModelLoaded"
    return _model

def get_model():
    if not _model:
        raise RuntimeError("Model not loaded yet.")
    return _model
