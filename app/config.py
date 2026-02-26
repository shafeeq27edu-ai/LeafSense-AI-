from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    gemini_api_key: str = "your_google_gemini_api_key_here"
    model_path: str = "models/plant_disease_model.h5"
    labels_path: str = "models/class_labels.json"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

def get_settings() -> Settings:
    return Settings()
