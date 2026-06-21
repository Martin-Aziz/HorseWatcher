from __future__ import annotations

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class HorseHealthContext(BaseModel):
    latest_heart_rate_bpm: int | None = None
    baseline_heart_rate: float | None = None
    latest_temp_c: float | None = None
    baseline_temp: float | None = None
    latest_hrv_ms: float | None = None
    baseline_hrv: float | None = None
    latest_activity_index: float | None = None
    active_alert_count: int = 0
    alert_summary: str = ""


class ChatRequest(BaseModel):
    horse_id: str
    horse_name: str
    message: str
    conversation_history: list[ChatMessage] = []
    context: HorseHealthContext = HorseHealthContext()


class ChatResponse(BaseModel):
    reply: str
