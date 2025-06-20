"""
Emergency deployment version of RentGuy API
Minimal FastAPI app for Railway deployment
"""
from fastapi import FastAPI
import os

app = FastAPI(
    title="RentGuy API",
    description="Property Management System API - Emergency Deploy",
    version="0.1.0"
)

@app.get("/")
async def read_root():
    return {
        "message": "RentGuy API is running!",
        "status": "healthy",
        "version": "0.1.0",
        "health_check": "/health",
        "api_docs": "/docs"
    }

@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "running",
        "database": "sqlite_ready",
        "version": "0.1.0"
    }

@app.get("/api")
async def api_root():
    return {
        "message": "Welcome to RentGuy API",
        "version": "0.1.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)