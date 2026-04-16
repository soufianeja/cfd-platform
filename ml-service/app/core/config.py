from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    ALLOWED_ORIGINS: List[str] = ["http://localhost:8080", "http://localhost:3000"]

    MODEL_DIR: str = "./models"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
