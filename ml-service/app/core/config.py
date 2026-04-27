from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "[IP_ADDRESS]"
    APP_PORT: int = 9000

    ALLOWED_ORIGINS: List[str] = ["http://localhost:8080", "http://localhost:3000"]

    MODEL_DIR: str = "./models"
    TRAINING_API_KEY: str = "your-secret-key-here"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
