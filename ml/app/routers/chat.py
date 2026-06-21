from __future__ import annotations

from fastapi import APIRouter

from app.engine.chat_engine import chat
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
    """Send a message to the HorseWatcher AI health assistant."""
    return chat(req)
