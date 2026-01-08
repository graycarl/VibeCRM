from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VibeCRM"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Using SQLite for MVP as per plan
    DATABASE_URL: str = "sqlite:///./vibecrm.sqlite"
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION" # TODO: Load from env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
