import logging
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.base import Base, engine, SessionLocal
from app.startup import init_db, check_db_connected

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create database tables."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

# Create the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RentGuy Property Management System API",
    version=settings.VERSION,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
cors_origins = settings.BACKEND_CORS_ORIGINS or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Configure static file serving for frontend
def setup_static_files():
    """Setup static file serving with proper MIME types"""
    # Try multiple possible static file locations
    possible_static_dirs = [
        "/app/static",  # Railway deployment path
        "../static",    # Local relative to backend
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static"),
        "/app/frontend/dist",
        "static"        # If running from root
    ]
    
    static_dir = None
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Looking for static files in: {possible_static_dirs}")
    
    for directory in possible_static_dirs:
        logger.info(f"Checking directory: {directory}")
        if os.path.exists(directory):
            static_dir = directory
            logger.info(f"Found static files at: {directory}")
            # List contents for debugging
            try:
                contents = os.listdir(directory)
                logger.info(f"Static directory contents: {contents}")
            except Exception as e:
                logger.warning(f"Could not list directory contents: {e}")
            break
        else:
            logger.info(f"Directory does not exist: {directory}")
    
    if static_dir:
        try:
            # Mount assets directory with proper MIME type handling
            assets_dir = os.path.join(static_dir, "assets")
            if os.path.exists(assets_dir):
                app.mount("/assets", StaticFiles(directory=assets_dir, check_dir=False), name="assets")
                logger.info(f"Mounted assets from: {assets_dir}")
            
            # Mount other static files (logos, favicon, etc.)
            app.mount("/static", StaticFiles(directory=static_dir, check_dir=False), name="static")
            logger.info(f"Mounted static files from: {static_dir}")
            return static_dir
        except Exception as e:
            logger.warning(f"Could not mount static files from {static_dir}: {e}")
    
    logger.warning("No static directory found. Frontend will not be served.")
    return None

# Setup static files
STATIC_DIR = setup_static_files()


# Initialize database and create first superuser on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up...")
    try:
        # Check database connection
        if not check_db_connected():
            logger.warning("Could not connect to the database during startup. Will retry later.")
            return
        
        # Initialize database
        init_db()
        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.warning(f"Error during startup (continuing anyway): {e}")
        # Don't raise - let the application start anyway
        # Database might become available later

# Health check endpoint
@app.get(f"{settings.API_V1_STR}/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns 200 even if database is not ready - Railway healthcheck should pass.
    """
    db = None
    database_status = "disconnected"
    database_error = None
    
    try:
        # Try to check database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.commit()
        database_status = "connected"
    except Exception as e:
        database_error = str(e)
        logger.warning(f"Database not ready during health check: {e}")
        # Don't raise exception - let the service be considered healthy
        # Database might just be starting up
    finally:
        if db:
            try:
                db.close()
            except:
                pass
    
    # Always return 200 OK for Railway health check
    response = {
        "status": "healthy",
        "service": "running",
        "database": database_status,
        "version": settings.VERSION
    }
    
    if database_error:
        response["database_error"] = database_error
        
    return response

# Simple health check endpoint (for Railway)
@app.get("/health")
async def simple_health_check():
    """
    Simple health check endpoint without database check for Railway.
    """
    return {"status": "ok"}

# More detailed health check endpoint  
@app.get("/api/health")
async def detailed_health_check():
    """
    Detailed health check endpoint with system info.
    """
    return {
        "status": "healthy", 
        "message": "RentGuy API is running",
        "version": settings.VERSION
    }

# API Root endpoint
@app.get("/api")
async def api_root():
    """
    API Root endpoint that provides basic API information.
    """
    return {
        "message": "Welcome to RentGuy API",
        "version": settings.VERSION,
        "docs": "/api/v1/docs"
    }

# Custom route to serve JavaScript files with correct MIME type
@app.get("/assets/{file_path:path}")
async def serve_assets(file_path: str):
    """Serve asset files with proper MIME types"""
    if not STATIC_DIR:
        raise HTTPException(status_code=404, detail="Static files not configured")
    
    assets_dir = os.path.join(STATIC_DIR, "assets")
    file_full_path = os.path.join(assets_dir, file_path)
    
    if not os.path.exists(file_full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine MIME type based on file extension
    if file_path.endswith('.js'):
        media_type = "application/javascript"
    elif file_path.endswith('.css'):
        media_type = "text/css"
    elif file_path.endswith('.map'):
        media_type = "application/json"
    else:
        media_type = None
    
    return FileResponse(file_full_path, media_type=media_type)

# Frontend fallback route - serve index.html for SPA routing
@app.get("/", include_in_schema=False)
async def read_frontend():
    """Serve frontend index.html or API info"""
    logger.info(f"Root route accessed. STATIC_DIR: {STATIC_DIR}")
    
    if STATIC_DIR:
        index_file = os.path.join(STATIC_DIR, "index.html")
        logger.info(f"Looking for index.html at: {index_file}")
        
        if os.path.exists(index_file):
            logger.info(f"Serving index.html from: {index_file}")
            return FileResponse(index_file, media_type="text/html")
        else:
            logger.warning(f"index.html not found at: {index_file}")
    else:
        logger.warning("STATIC_DIR is None - no static files configured")
    
    # Fallback to API info if no frontend found
    logger.info("Serving API info instead of frontend")
    return {
        "message": "RentGuy API is running!",
        "api_docs": "/api/v1/docs",
        "health_check": "/api/v1/health",
        "version": settings.VERSION,
        "static_dir": STATIC_DIR,
        "cwd": os.getcwd()
    }

# Catch-all route for SPA routing (must be last)
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    """Catch-all route for SPA routing - serve index.html for non-API routes"""
    # Don't intercept API routes
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
        raise HTTPException(status_code=404, detail="Not found")
    
    if STATIC_DIR:
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file, media_type="text/html")
    
    raise HTTPException(status_code=404, detail="Frontend not found")
