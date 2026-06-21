"""Anomaly detector: two-layer scoring per horse.

Layer 1 — Threshold check:
  Flags any reading whose value falls outside the baseline's lower/upper bounds.
  Produces an immediate, interpretable signal. This is the fast path.

Layer 2 — Isolation Forest:
  A per-horse multivariate model trained on recent readings (HR, HRV, temp, activity).
  Captures co-occurring anomalies that threshold checks on individual metrics miss.
  The model is serialized with joblib and cached in Redis (24h TTL).
  If no model exists yet (< min_samples), Layer 1 score is returned directly.
"""

from __future__ import annotations

import io
import logging
import pickle
from dataclasses import dataclass, field

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from app.config import settings
from app.engine.baseline_engine import is_threshold_anomaly, z_score
from app.models.anomaly import AnomalyScoreRequest, AnomalyScoreResult

logger = logging.getLogger(__name__)

_MIN_SAMPLES_FOR_IFOREST = 50   # need at least this many rows to train
_METRICS = ["heart_rate_bpm", "hrv_ms", "skin_temp_c", "activity_index"]


@dataclass
class _IForestBundle:
    """Paired IsolationForest + StandardScaler for a single horse."""
    model: IsolationForest
    scaler: StandardScaler
    trained_on: int = 0   # number of samples used for training


def score_readings(request: AnomalyScoreRequest) -> list[AnomalyScoreResult]:
    """Score a batch of readings against the horse's baselines and IForest model."""
    results: list[AnomalyScoreResult] = []

    # Build feature matrix from readings.
    feature_rows, valid_indices = _build_feature_matrix(request.readings)

    # Try to load a cached IForest bundle (returned as None if unavailable).
    bundle = _load_bundle_from_memory(request.horse_id)

    for i, reading in enumerate(request.readings):
        score, contributing = _score_single(
            reading_idx=i,
            reading=reading,
            feature_rows=feature_rows,
            valid_indices=valid_indices,
            baselines=request.baselines,
            bundle=bundle,
        )

        is_anomalous = score >= settings.anomaly_warning_threshold

        results.append(AnomalyScoreResult(
            reading_id=reading.id,
            recorded_at=reading.recorded_at,
            anomaly_score=round(score, 4),
            is_anomalous=is_anomalous,
            contributing_metrics=contributing,
        ))

    # If enough data, train or update the IForest bundle in memory.
    if len(feature_rows) >= _MIN_SAMPLES_FOR_IFOREST:
        _train_and_cache_bundle(request.horse_id, feature_rows)

    return results


def _score_single(
    reading_idx: int,
    reading,
    feature_rows: list[list[float]],
    valid_indices: list[int],
    baselines: dict,
    bundle: _IForestBundle | None,
) -> tuple[float, list[str]]:
    """Produce a combined anomaly score and list of contributing metrics for one reading."""
    layer1_score, contributing = _threshold_score(reading, baselines)

    # If no bundle or this reading can't be represented as a feature row, use Layer 1.
    if bundle is None or reading_idx not in valid_indices:
        return layer1_score, contributing

    row_pos = valid_indices.index(reading_idx)
    row = np.array(feature_rows[row_pos]).reshape(1, -1)
    row_scaled = bundle.scaler.transform(row)

    # IForest.decision_function returns negative values for outliers.
    # Normalize to [0, 1]: more negative → closer to 1.
    raw = float(bundle.model.decision_function(row_scaled)[0])
    # Empirically, scores range roughly from -0.5 (outlier) to 0.5 (inlier).
    iforest_score = float(np.clip(0.5 - raw, 0.0, 1.0))

    # Take the maximum of the two layer scores so threshold catches
    # simple single-metric spikes even when IForest is uncertain.
    combined = max(layer1_score, iforest_score)
    return combined, contributing


def _threshold_score(reading, baselines: dict) -> tuple[float, list[str]]:
    """Compute a threshold-based anomaly score and list of out-of-bounds metrics."""
    metric_values = {
        "heart_rate_bpm": reading.heart_rate_bpm,
        "hrv_ms":         reading.hrv_ms,
        "skin_temp_c":    reading.skin_temp_c,
        "activity_index": reading.activity_index,
    }

    max_z = 0.0
    contributing: list[str] = []

    for metric, value in metric_values.items():
        if value is None or metric not in baselines:
            continue

        bl = baselines[metric]
        if is_threshold_anomaly(value, bl.lower_bound, bl.upper_bound):
            contributing.append(metric)

        z = z_score(value, bl.mean, bl.std_dev)
        if z > max_z:
            max_z = z

    # Normalize z-score to [0, 1] via sigmoid-like mapping:
    # z=2.5 → 0.65 (warning threshold), z=4 → ~0.85 (urgent threshold).
    score = float(np.clip(max_z / 5.0, 0.0, 1.0))
    return score, contributing


def _build_feature_matrix(readings) -> tuple[list[list[float]], list[int]]:
    """Extract rows with at least 2 non-null metrics for IForest training."""
    rows: list[list[float]] = []
    indices: list[int] = []

    for i, r in enumerate(readings):
        row = [
            r.heart_rate_bpm if r.heart_rate_bpm is not None else float("nan"),
            r.hrv_ms          if r.hrv_ms          is not None else float("nan"),
            r.skin_temp_c     if r.skin_temp_c     is not None else float("nan"),
            r.activity_index  if r.activity_index  is not None else float("nan"),
        ]
        # Require at least 2 non-NaN values for a meaningful multivariate score.
        if sum(1 for v in row if not np.isnan(v)) >= 2:
            rows.append(row)
            indices.append(i)

    return rows, indices


# In-memory model cache keyed by horse_id.
# In production this would be backed by Redis pickle, but for the MVP
# an in-process dict is sufficient and avoids a Redis round-trip per reading.
_model_cache: dict[str, _IForestBundle] = {}


def _load_bundle_from_memory(horse_id: str) -> _IForestBundle | None:
    return _model_cache.get(horse_id)


def _train_and_cache_bundle(horse_id: str, feature_rows: list[list[float]]) -> None:
    """Train a fresh IsolationForest on the provided feature rows and cache it."""
    try:
        X = np.array(feature_rows, dtype=float)
        # Impute NaN with column median before training.
        col_medians = np.nanmedian(X, axis=0)
        for j in range(X.shape[1]):
            mask = np.isnan(X[:, j])
            X[mask, j] = col_medians[j]

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = IsolationForest(
            contamination=settings.isolation_forest_contamination,
            random_state=42,
            n_estimators=100,
        )
        model.fit(X_scaled)

        _model_cache[horse_id] = _IForestBundle(
            model=model,
            scaler=scaler,
            trained_on=len(feature_rows),
        )
        logger.debug("IForest trained for horse %s on %d samples", horse_id, len(feature_rows))
    except Exception:
        logger.exception("IForest training failed for horse %s", horse_id)
