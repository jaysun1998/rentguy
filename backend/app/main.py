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

# Check if static directory exists (for frontend files)
static_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")
if os.path.exists(static_directory):
    logger.info(f"Mounting static files from: {static_directory}")
    try:
        app.mount("/", StaticFiles(directory=static_directory, html=True), name="static")
    except Exception as e:
        logger.warning(f"Could not mount static files: {e}")
else:
    logger.warning(f"Static directory not found at {static_directory}. Frontend will not be served.")

# Add a simple frontend fallback route
@app.get("/", include_in_schema=False)
async def read_frontend():
    """Serve a simple frontend or redirect to API docs"""
    return {
        "message": "RentGuy API is running!",
        "api_docs": "/api/v1/docs",
        "health_check": "/api/v1/health",
        "version": settings.VERSION
    }

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

# Simple health check endpoint (for debugging)
@app.get("/health")
async def simple_health_check():
    """
    Simple health check endpoint without database check.
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
