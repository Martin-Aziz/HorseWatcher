"""Baseline engine: computes per-horse, per-metric statistical baselines.

Two-phase strategy:
  Bootstrap phase  (<14 days data): blend equine reference priors with observed data.
  Personalized phase (>=14 days):   pure individual rolling-window statistics.
"""

from __future__ import annotations

import numpy as np
from scipy import stats

from app.models.baseline import BaselineResult

# Equine reference ranges used as priors during the bootstrap phase.
# Source: standard veterinary references (Merck Veterinary Manual).
_REFERENCE_PRIORS: dict[str, tuple[float, float]] = {
    "heart_rate_bpm": (32.0, 4.0),    # (mean, std_dev)
    "hrv_ms":         (65.0, 15.0),
    "skin_temp_c":    (37.75, 0.25),
    "rectal_temp_c":  (38.0, 0.25),
    "respiratory_rate": (14.0, 2.0),
    "activity_index": (20.0, 15.0),
}

_BOOTSTRAP_DAYS = 14
_SIGMA_MULTIPLIER = 2.5   # lower/upper bound = mean ± 2.5σ


def compute_baseline(
    horse_id: str,
    metric: str,
    values: list[float],
    window_days: int = 30,
) -> BaselineResult:
    """Compute a baseline from a list of observed metric values.

    When fewer than _BOOTSTRAP_DAYS worth of samples are present, the result
    is blended with the equine reference prior to avoid overfitting to a short
    observation window.
    """
    if not values:
        raise ValueError(f"cannot compute baseline for {metric}: empty values list")

    arr = np.array(values, dtype=float)
    arr = arr[np.isfinite(arr)]  # strip NaN / Inf that the device might send
    if len(arr) == 0:
        raise ValueError(f"no finite values for metric {metric}")

    # Determine whether we're still in bootstrap phase.
    # The caller passes all available samples; we infer phase from sample count
    # relative to a 10-minute sampling cadence over bootstrap_days.
    samples_per_day = 144  # 24h × 6 readings/hour at 10-min intervals
    bootstrap_threshold = _BOOTSTRAP_DAYS * samples_per_day
    is_bootstrapped = len(arr) < bootstrap_threshold

    if is_bootstrapped and metric in _REFERENCE_PRIORS:
        arr = _blend_with_prior(arr, metric)

    mean = float(np.mean(arr))
    std_dev = float(np.std(arr, ddof=1)) if len(arr) > 1 else 0.0
    percentiles = np.percentile(arr, [5, 25, 50, 75, 95])

    lower_bound = mean - _SIGMA_MULTIPLIER * std_dev
    upper_bound = mean + _SIGMA_MULTIPLIER * std_dev

    return BaselineResult(
        horse_id=horse_id,
        metric=metric,
        window_days=window_days,
        mean=round(mean, 4),
        std_dev=round(std_dev, 4),
        p5=round(float(percentiles[0]), 4),
        p25=round(float(percentiles[1]), 4),
        p50=round(float(percentiles[2]), 4),
        p75=round(float(percentiles[3]), 4),
        p95=round(float(percentiles[4]), 4),
        lower_bound=round(lower_bound, 4),
        upper_bound=round(upper_bound, 4),
        sample_count=len(arr),
        is_bootstrapped=is_bootstrapped,
    )


def _blend_with_prior(observed: np.ndarray, metric: str) -> np.ndarray:
    """Blend observed values with the equine reference prior.

    Uses a simple weighted concatenation: the synthetic prior sample
    has weight proportional to how much data is missing relative to the
    bootstrap threshold. As more data arrives, the prior's influence fades.
    """
    prior_mean, prior_std = _REFERENCE_PRIORS[metric]
    samples_per_day = 144
    bootstrap_threshold = _BOOTSTRAP_DAYS * samples_per_day

    # Number of synthetic prior samples decreases as observed data grows.
    n_synthetic = max(1, bootstrap_threshold - len(observed))
    rng = np.random.default_rng(seed=hash(metric) % (2**31))
    synthetic = rng.normal(loc=prior_mean, scale=prior_std, size=n_synthetic)

    return np.concatenate([observed, synthetic])


def z_score(value: float, mean: float, std_dev: float) -> float:
    """Return the absolute z-score of a value relative to a baseline."""
    if std_dev == 0:
        return 0.0
    return abs((value - mean) / std_dev)


def is_threshold_anomaly(value: float, lower: float, upper: float) -> bool:
    """Report whether a value falls outside the baseline confidence band."""
    return value < lower or value > upper
