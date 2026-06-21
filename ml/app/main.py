from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import anomaly, baseline, chat


def create_app() -> FastAPI:
    app = FastAPI(
        title="HorseWatcher ML Service",
        description="Baseline computation, anomaly detection, and AI health assistant.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.include_router(baseline.router)
    app.include_router(anomaly.router)
    app.include_router(chat.router)

    @app.get("/healthz", tags=["health"])
    async def health() -> JSONResponse:
        return JSONResponse({"status": "ok"})

    return app


app = create_app()
