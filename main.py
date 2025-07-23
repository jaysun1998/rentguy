"""
Production deployment of RentGuy with static file serving
FastAPI app with proper MIME type handling for Railway deployment
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
import os

app = FastAPI(
    title="RentGuy API",
    description="Property Management System API - Production",
    version="1.0.0"
)

# Serve static files with proper MIME types
@app.get("/")
async def serve_index():
    """Serve the main HTML page"""
    return FileResponse("index.html", media_type="text/html")

@app.get("/demo")
async def serve_demo():
    """Serve the demo page"""
    return FileResponse("index.html", media_type="text/html")

@app.get("/test-properties")
async def serve_test():
    """Serve the property test page"""
    return FileResponse("test_properties.html", media_type="text/html")

# Static file serving with custom MIME types
class CustomStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        
        # Fix MIME types for JavaScript modules
        if path.endswith(('.js', '.mjs')):
            response.headers['content-type'] = 'application/javascript'
        elif path.endswith('.ts'):
            response.headers['content-type'] = 'application/javascript'  
        elif path.endswith('.tsx'):
            response.headers['content-type'] = 'application/javascript'
        elif path.endswith('.jsx'):
            response.headers['content-type'] = 'application/javascript'
        
        return response

# Mount static files if they exist
if os.path.exists("frontend/dist"):
    app.mount("/static", CustomStaticFiles(directory="frontend/dist"), name="static")
    
    @app.get("/app")
    async def serve_react_app():
        """Serve the React app"""
        return FileResponse("frontend/dist/index.html", media_type="text/html")

@app.get("/api")
async def read_root():
    return {
        "message": "RentGuy API is running!",
        "status": "healthy",
        "version": "1.0.0",
        "health_check": "/health",
        "api_docs": "/docs",
        "demo": "/demo",
        "test": "/test-properties"
    }

@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "running",
        "database": "sqlite_ready",
        "version": "1.0.0",
        "mime_fix": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)