from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.auth import ServiceAuthMiddleware
from app.api.routes import feed, resume, jobs, health

app = FastAPI(
    title="ConnectSphere Python Intelligence Service",
    description="Microservice providing Feed Recommendation, Resume Parsing, and Job Matching.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware allowing communication with NestJS API and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Internal Service-to-Service Authentication
app.add_middleware(ServiceAuthMiddleware)

# Include API Routers
app.include_router(health.router)
app.include_router(feed.router)
app.include_router(resume.router)
app.include_router(jobs.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
