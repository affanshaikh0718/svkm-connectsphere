import time
from fastapi import APIRouter

router = APIRouter(tags=["Health"])
start_timestamp = time.time()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "connectsphere-python-service",
        "uptime_seconds": round(time.time() - start_timestamp, 1),
        "version": "1.0.0"
    }
