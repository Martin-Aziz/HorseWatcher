from __future__ import annotations

from fastapi import APIRouter

from app.engine.anomaly_detector import score_readings
from app.models.anomaly import AnomalyScoreRequest, AnomalyScoreResult

router = APIRouter(prefix="/anomaly", tags=["anomaly"])


@router.post("/score", response_model=list[AnomalyScoreResult])
async def score(req: AnomalyScoreRequest) -> list[AnomalyScoreResult]:
    """Score a batch of sensor readings for anomalies."""
    return score_readings(req)
