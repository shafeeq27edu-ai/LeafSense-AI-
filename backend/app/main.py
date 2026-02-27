import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.api.routes import router
from app.dependencies import limiter
from app.utils.error_handler import global_exception_handler, _rate_limit_exceeded_handler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

if not settings.frontend_url:
    logger.critical("PRODUCTION ERROR: FRONTEND_URL is not set.")
    raise SystemExit("Fatal: Missing FRONTEND_URL environment variable.")

app = FastAPI(
    title="AgriVision AI Production",
    description="Backend API for detecting plant diseases using FastApi, CNN (MobileNetV2), and providing treatment via Gemini.",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)
