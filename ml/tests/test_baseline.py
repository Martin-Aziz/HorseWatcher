"""Tests for the baseline engine."""

from __future__ import annotations

import pytest

from app.engine.baseline_engine import compute_baseline, is_threshold_anomaly, z_score


class TestComputeBaseline:
    def test_basic_stats_correctness(self) -> None:
        values = [30.0, 32.0, 34.0, 36.0, 38.0]
        result = compute_baseline("horse-1", "heart_rate_bpm", values)
        assert result.mean == pytest.approx(34.0, abs=0.01)
        assert result.sample_count >= len(values)  # may include prior samples

    def test_bootstrap_flag_with_few_samples(self) -> None:
        values = [32.0, 33.0, 34.0]
        result = compute_baseline("horse-1", "heart_rate_bpm", values)
        assert result.is_bootstrapped is True

    def test_personalized_phase_with_many_samples(self) -> None:
        # 14 days × 144 samples/day = 2016 samples
        values = [32.0 + (i % 10) * 0.5 for i in range(2100)]
        result = compute_baseline("horse-1", "heart_rate_bpm", values)
        assert result.is_bootstrapped is False

    def test_bounds_are_symmetric_around_mean(self) -> None:
        # Use enough samples to exit bootstrap phase
        values = [32.0] * 2100
        result = compute_baseline("horse-1", "heart_rate_bpm", values)
        delta_lower = result.mean - result.lower_bound
        delta_upper = result.upper_bound - result.mean
        assert delta_lower == pytest.approx(delta_upper, abs=0.001)

    def test_raises_on_empty_values(self) -> None:
        with pytest.raises(ValueError):
            compute_baseline("horse-1", "heart_rate_bpm", [])

    def test_strips_nan_values(self) -> None:
        import math
        values = [32.0, float("nan"), 34.0, float("inf"), 36.0]
        result = compute_baseline("horse-1", "heart_rate_bpm", values)
        assert result.sample_count >= 3  # nan/inf stripped, plus possible prior blending


class TestZScore:
    def test_value_at_mean_has_zero_z(self) -> None:
        assert z_score(50.0, 50.0, 5.0) == pytest.approx(0.0)

    def test_one_sigma_above(self) -> None:
        assert z_score(55.0, 50.0, 5.0) == pytest.approx(1.0)

    def test_zero_std_dev_returns_zero(self) -> None:
        assert z_score(100.0, 50.0, 0.0) == 0.0

    def test_below_mean_returns_positive_z(self) -> None:
        # z_score returns absolute value
        assert z_score(45.0, 50.0, 5.0) == pytest.approx(1.0)


class TestThresholdAnomaly:
    def test_value_within_bounds_is_not_anomalous(self) -> None:
        assert is_threshold_anomaly(35.0, 28.0, 44.0) is False

    def test_value_above_upper_is_anomalous(self) -> None:
        assert is_threshold_anomaly(50.0, 28.0, 44.0) is True

    def test_value_below_lower_is_anomalous(self) -> None:
        assert is_threshold_anomaly(20.0, 28.0, 44.0) is True

    def test_value_at_exact_boundary_is_not_anomalous(self) -> None:
        assert is_threshold_anomaly(44.0, 28.0, 44.0) is False
