from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "VibeCRM"
    API_V1_STR: str = "/api/v1"
    
    # Database
    # Using SQLite for MVP as per plan
    DATABASE_URL: str = "sqlite:///../db/vibecrm.sqlite"
    SEED_DIR_PATH: str = "../db/seed"
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION" # TODO: Load from env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
