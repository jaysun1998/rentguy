"""
Ultra-minimal FastAPI app for Railway deployment
"""
from fastapi import FastAPI
import os

app = FastAPI(title="RentGuy API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "RentGuy API is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "running"}

@app.get("/api/v1/health")
def api_health_check():
    return {"status": "healthy", "service": "running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)