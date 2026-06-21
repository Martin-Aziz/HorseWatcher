from __future__ import annotations

from fastapi import APIRouter

from app.engine.baseline_engine import compute_baseline
from app.models.baseline import BaselineComputeRequest, BaselineResult

router = APIRouter(prefix="/baseline", tags=["baseline"])


@router.post("/compute", response_model=BaselineResult)
async def compute(req: BaselineComputeRequest) -> BaselineResult:
    """Compute a statistical baseline from a list of observed values."""
    return compute_baseline(
        horse_id=req.horse_id,
        metric=req.metric,
        values=req.readings,
        window_days=req.window_days,
    )
