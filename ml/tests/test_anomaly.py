"""Tests for the anomaly detector."""

from __future__ import annotations

import pytest

from app.engine.anomaly_detector import score_readings
from app.models.anomaly import AnomalyScoreRequest, BaselineInput, ReadingInput


def _make_baselines() -> dict[str, BaselineInput]:
    return {
        "heart_rate_bpm": BaselineInput(mean=32.0, std_dev=3.0, lower_bound=24.5, upper_bound=39.5),
        "skin_temp_c":    BaselineInput(mean=37.8, std_dev=0.2, lower_bound=37.3, upper_bound=38.3),
        "hrv_ms":         BaselineInput(mean=65.0, std_dev=10.0, lower_bound=40.0, upper_bound=90.0),
        "activity_index": BaselineInput(mean=20.0, std_dev=12.0, lower_bound=0.0, upper_bound=50.0),
    }


class TestScoreReadings:
    def test_normal_reading_has_low_score(self) -> None:
        req = AnomalyScoreRequest(
            horse_id="horse-1",
            readings=[
                ReadingInput(
                    id="r1",
                    recorded_at="2026-06-21T10:00:00Z",
                    heart_rate_bpm=32,
                    hrv_ms=65.0,
                    skin_temp_c=37.8,
                    activity_index=20.0,
                )
            ],
            baselines=_make_baselines(),
        )
        results = score_readings(req)
        assert len(results) == 1
        assert results[0].anomaly_score < 0.65
        assert results[0].is_anomalous is False

    def test_elevated_heart_rate_triggers_warning(self) -> None:
        req = AnomalyScoreRequest(
            horse_id="horse-2",
            readings=[
                ReadingInput(
                    id="r2",
                    recorded_at="2026-06-21T10:00:00Z",
                    heart_rate_bpm=55,   # ~7.7σ above baseline mean of 32
                    hrv_ms=30.0,
                    skin_temp_c=38.9,
                    activity_index=5.0,
                )
            ],
            baselines=_make_baselines(),
        )
        results = score_readings(req)
        assert results[0].is_anomalous is True
        assert "heart_rate_bpm" in results[0].contributing_metrics

    def test_result_count_matches_input_count(self) -> None:
        readings = [
            ReadingInput(id=f"r{i}", recorded_at="2026-06-21T10:00:00Z", heart_rate_bpm=32)
            for i in range(5)
        ]
        req = AnomalyScoreRequest(
            horse_id="horse-3",
            readings=readings,
            baselines=_make_baselines(),
        )
        results = score_readings(req)
        assert len(results) == 5

    def test_missing_metric_does_not_crash(self) -> None:
        req = AnomalyScoreRequest(
            horse_id="horse-4",
            readings=[
                ReadingInput(id="r1", recorded_at="2026-06-21T10:00:00Z")
                # All metric values are None
            ],
            baselines=_make_baselines(),
        )
        results = score_readings(req)
        assert len(results) == 1
        assert results[0].anomaly_score == pytest.approx(0.0)

    def test_score_is_clamped_between_0_and_1(self) -> None:
        req = AnomalyScoreRequest(
            horse_id="horse-5",
            readings=[
                ReadingInput(
                    id="r1",
                    recorded_at="2026-06-21T10:00:00Z",
                    heart_rate_bpm=200,   # extreme outlier
                )
            ],
            baselines=_make_baselines(),
        )
        results = score_readings(req)
        assert 0.0 <= results[0].anomaly_score <= 1.0
