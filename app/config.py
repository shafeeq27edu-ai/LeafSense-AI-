from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    gemini_api_key: str = "your_google_gemini_api_key_here"
    model_path: str = "models/plant_disease_model.h5"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
