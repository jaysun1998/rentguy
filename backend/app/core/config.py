from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional, List, Union
from pydantic import validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "RentGuy API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Database
    DATABASE_URL: str
    
    # First Superuser
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    FIRST_SUPERUSER_FIRST_NAME: str
    FIRST_SUPERUSER_LAST_NAME: str
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_nested_delimiter = "__"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
