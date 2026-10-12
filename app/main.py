import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import presentations, slides, api_slides, checkpoint

app = FastAPI(
    title="PowerPoint Clone API",
    description="Backend service for managing presentations and slides.",
    version="1.0.0",
)

# CORS configuration – allow all origins for development; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(presentations.router, prefix="/api/v1", tags=["presentations"])
app.include_router(slides.router, prefix="/api/v1", tags=["slides"])
app.include_router(api_slides.router, prefix="/api/v1", tags=["static-slides"])
app.include_router(checkpoint.router, prefix="/api/v1", tags=["checkpoint"])

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.on_event("shutdown")
async def on_shutdown():
    # No explicit cleanup needed; SQLModel disposes the engine on process exit.
    pass

if __name__ == "__main__":
    # Run the server with reload for development
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)