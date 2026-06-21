from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ML_", case_sensitive=False)

    database_url: str = "postgresql+asyncpg://carrot:changeme@localhost:5432/carrot_watch"
    redis_url: str = "redis://:changeme@localhost:6379/1"
    anthropic_api_key: str = ""
    port: int = 8001

    # Baseline configuration
    baseline_window_days: int = 30
    baseline_bootstrap_days: int = 14

    # Anomaly thresholds
    anomaly_warning_threshold: float = 0.65
    anomaly_urgent_threshold: float = 0.85
    isolation_forest_contamination: float = 0.05

    # Redis TTLs in seconds
    baseline_cache_ttl: int = 3600       # 1 hour
    model_cache_ttl: int = 86400         # 24 hours


settings = Settings()
