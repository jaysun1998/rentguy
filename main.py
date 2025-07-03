"""
Entry point for Railway deployment.
Imports the full backend application with Google OAuth support.
"""
import sys
import os

# Add the current directory to Python path so backend module can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Import the full backend app with all features
    from backend.app.main import app
    print("Successfully imported full backend app with Google OAuth")
except ImportError as e:
    print(f"Failed to import backend app: {e}")
    # Fallback to a simple app if backend import fails
    from fastapi import FastAPI
    
    app = FastAPI(
        title="RentGuy API - Fallback",
        description="Property Management System API - Fallback Mode",
        version="0.1.0"
    )
    
    @app.get("/")
    async def read_root():
        return {
            "message": "RentGuy API is running in fallback mode!",
            "status": "limited",
            "version": "0.1.0",
            "error": "Backend import failed"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)