"""
Entry point for Railway deployment.
Imports the full backend application with Google OAuth support.
"""
import sys
import os

# Add debugging information
print(f"Current working directory: {os.getcwd()}")
print(f"Python path: {sys.path}")
print(f"Contents of current directory: {os.listdir('.')}")

# If you have an 'app' directory, check its contents
if os.path.exists('app'):
    print(f"Contents of app directory: {os.listdir('app')}")

# If you have a 'backend' directory, check its contents
if os.path.exists('backend'):
    print(f"Contents of backend directory: {os.listdir('backend')}")
    if os.path.exists('backend/app'):
        print(f"Contents of backend/app directory: {os.listdir('backend/app')}")

# Add the current directory to Python path so backend module can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Also add the backend directory to the path
backend_dir = os.path.join(current_dir, 'backend')
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)

print(f"Current directory: {current_dir}")
print(f"Backend directory: {backend_dir}")
print(f"Python path: {sys.path[:3]}")

try:
    # Import the full backend app with all features
    from backend.app.main import app
    print("✅ Successfully imported full backend app with Google OAuth")
except ImportError as e:
    print(f"❌ Failed to import backend app: {e}")
    import traceback
    traceback.print_exc()
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