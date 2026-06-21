from __future__ import annotations

from pydantic import BaseModel, Field


class ReadingInput(BaseModel):
    id: str
    recorded_at: str
    heart_rate_bpm: int | None = None
    hrv_ms: float | None = None
    skin_temp_c: float | None = None
    activity_index: float | None = None


class BaselineInput(BaseModel):
    mean: float
    std_dev: float
    lower_bound: float
    upper_bound: float


class AnomalyScoreRequest(BaseModel):
    horse_id: str
    readings: list[ReadingInput] = Field(..., min_length=1)
    baselines: dict[str, BaselineInput] = Field(default_factory=dict)


class AnomalyScoreResult(BaseModel):
    reading_id: str
    recorded_at: str
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    is_anomalous: bool
    contributing_metrics: list[str] = Field(default_factory=list)
