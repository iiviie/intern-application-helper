from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variables."""

    # App settings
    app_name: str = "Internship Application Generator"
    app_version: str = "1.0.0"
    debug: bool = True

    # Database settings
    database_url: str = "sqlite+aiosqlite:///./internship_app.db"

    # Gemini API settings
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-pro"

    # LangSmith settings (optional)
    langsmith_api_key: str | None = None
    langsmith_project: str | None = None

    # CORS settings
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
