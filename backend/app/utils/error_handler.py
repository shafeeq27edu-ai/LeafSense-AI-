import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from fastapi import HTTPException

logger = logging.getLogger(__name__)

ERROR_CODES = {
    "NOT_A_PLANT": "NOT_A_PLANT",
    "FILE_TOO_LARGE": "FILE_TOO_LARGE",
    "INVALID_FORMAT": "INVALID_FORMAT",
    "SERVER_BUSY": "SERVER_BUSY",
    "MODEL_ERROR": "MODEL_ERROR",
    "GEMINI_TIMEOUT": "GEMINI_TIMEOUT",
    "RATE_LIMITED": "RATE_LIMITED",
    "INTERNAL_ERROR": "INTERNAL_ERROR",
    "VALIDATION_ERROR": "VALIDATION_ERROR"
}

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global catch: {exc}")
    
    if isinstance(exc, RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Too many requests. Please wait before retrying.",
                "code": ERROR_CODES["RATE_LIMITED"]
            }
        )

    if isinstance(exc, RequestValidationError):
        first_err = exc.errors()[0] if exc.errors() else {"msg": "Validation failed"}
        return JSONResponse(
            status_code=422,
            content={
                "detail": str(first_err.get("msg", "Validation error")),
                "code": ERROR_CODES["VALIDATION_ERROR"]
            }
        )

    if isinstance(exc, HTTPException):
        # Allow structured details to pass through (e.g., from OOD detector)
        if isinstance(exc.detail, dict):
            return JSONResponse(status_code=exc.status_code, content=exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": getattr(exc, 'code', ERROR_CODES["INTERNAL_ERROR"])}
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": ERROR_CODES["INTERNAL_ERROR"]}
    )
