from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.config import settings

class ServiceAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow health and documentation endpoints without internal token
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        secret = request.headers.get("X-Service-Secret")
        if not secret or secret != settings.service_secret:
            return JSONResponse(
                {"detail": "Unauthorized: Invalid or missing X-Service-Secret"},
                status_code=401
            )

        return await call_next(request)
