from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.router import router as api_router, load_and_run_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run pipeline and cache results in memory
    print(f"[*] Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    load_and_run_pipeline()
    print("[*] Pipelines ready. Service live.")
    yield
    # Shutdown: Clean up if needed
    print("[*] Shutting down service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Risk Intelligence Layer for MPLADS Scheme (SIH26102)",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development and external frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
