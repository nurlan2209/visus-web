from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "VISUS API"
    database_url: str = Field("postgresql+psycopg2://visus:visus@db:5432/visus", alias="DATABASE_URL")
    allowed_origins: str = Field("http://localhost:5173,http://localhost:4173", alias="ALLOWED_ORIGINS")
    admin_username: str = Field("admin", alias="ADMIN_USERNAME")
    admin_password: str = Field("admin", alias="ADMIN_PASSWORD")
    storage_mode: str = Field("local", alias="STORAGE_MODE")
    local_storage_path: str = Field("/app/storage", alias="LOCAL_STORAGE_PATH")
    local_public_url: str = Field("http://localhost:8080/media", alias="LOCAL_PUBLIC_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
