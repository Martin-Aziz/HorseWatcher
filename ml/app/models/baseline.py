from __future__ import annotations

from pydantic import BaseModel, Field


class BaselineComputeRequest(BaseModel):
    horse_id: str
    metric: str
    readings: list[float] = Field(..., min_length=1)
    window_days: int = 30


class BaselineResult(BaseModel):
    horse_id: str
    metric: str
    window_days: int
    mean: float
    std_dev: float
    p5: float
    p25: float
    p50: float
    p75: float
    p95: float
    lower_bound: float
    upper_bound: float
    sample_count: int
    is_bootstrapped: bool  # True when using reference priors (< bootstrap_days data)
