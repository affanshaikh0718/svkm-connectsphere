import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    service_secret: str = os.getenv("PYTHON_SERVICE_SECRET", "cs_internal_service_secret_2026")
    api_url: str = os.getenv("PYTHON_API_URL", "http://localhost:4000")
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_prefix = "PYTHON_"

settings = Settings()
