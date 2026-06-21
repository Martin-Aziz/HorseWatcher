"""AI chat engine: enriches user messages with horse health context then calls Claude."""

from __future__ import annotations

import logging

import anthropic

from app.config import settings
from app.models.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

_MODEL = "claude-haiku-4-5-20251001"
_MAX_TOKENS = 512


def build_system_prompt(req: ChatRequest) -> str:
    ctx = req.context
    lines = [
        f"You are HorseWatcher AI, an equine health assistant for {req.horse_name}.",
        "Answer questions about horse health using the provided live data.",
        "Respond in plain, caring language suitable for horse owners — not medical jargon.",
        "Rate concern levels as: Normal / Slightly elevated / Moderate concern / High concern.",
        "",
        f"=== Current data for {req.horse_name} ===",
    ]

    if ctx.latest_heart_rate_bpm is not None:
        baseline_note = ""
        if ctx.baseline_heart_rate:
            diff = ctx.latest_heart_rate_bpm - ctx.baseline_heart_rate
            baseline_note = f" (baseline: {ctx.baseline_heart_rate:.0f} bpm, diff: {diff:+.0f})"
        lines.append(f"Heart rate: {ctx.latest_heart_rate_bpm} bpm{baseline_note}")

    if ctx.latest_temp_c is not None:
        baseline_note = ""
        if ctx.baseline_temp:
            diff = ctx.latest_temp_c - ctx.baseline_temp
            baseline_note = f" (baseline: {ctx.baseline_temp:.2f}°C, diff: {diff:+.2f})"
        lines.append(f"Temperature: {ctx.latest_temp_c:.2f}°C{baseline_note}")

    if ctx.latest_hrv_ms is not None:
        baseline_note = ""
        if ctx.baseline_hrv:
            diff = ctx.latest_hrv_ms - ctx.baseline_hrv
            baseline_note = f" (baseline: {ctx.baseline_hrv:.1f} ms, diff: {diff:+.1f})"
        lines.append(f"HRV: {ctx.latest_hrv_ms:.1f} ms{baseline_note}")

    if ctx.latest_activity_index is not None:
        lines.append(f"Activity index: {ctx.latest_activity_index:.1f}/100")

    if ctx.active_alert_count > 0:
        lines.append(f"Active alerts: {ctx.active_alert_count}")
        if ctx.alert_summary:
            lines.append(f"Alert summary: {ctx.alert_summary}")
    else:
        lines.append("Active alerts: None")

    lines += [
        "",
        "Answer concisely. If you recommend veterinary attention, say so clearly.",
        "Do NOT diagnose specific conditions — describe observations and suggest monitoring or vet consultation.",
    ]

    return "\n".join(lines)


def chat(req: ChatRequest) -> ChatResponse:
    """Send a user message to Claude with injected health context."""
    if not settings.anthropic_api_key:
        return ChatResponse(
            reply=(
                "The AI assistant is not configured yet. "
                "Please set ANTHROPIC_API_KEY to enable this feature."
            )
        )

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    # Build the conversation messages.
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in req.conversation_history
        if msg.role in ("user", "assistant")
    ]
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.messages.create(
            model=_MODEL,
            max_tokens=_MAX_TOKENS,
            system=build_system_prompt(req),
            messages=messages,
        )
        reply = response.content[0].text if response.content else "No response generated."
    except anthropic.APIError as exc:
        logger.error("Anthropic API error: %s", exc)
        reply = "I'm unable to respond right now. Please try again in a moment."

    return ChatResponse(reply=reply)
