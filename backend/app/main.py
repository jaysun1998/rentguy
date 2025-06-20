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
    app.mount("/", StaticFiles(directory=static_directory, html=True), name="static")
else:
    logger.warning(f"Static directory not found at {static_directory}. Frontend will not be served.")

# Initialize database and create first superuser on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up...")
    try:
        # Check database connection
        if not check_db_connected():
            logger.error("Could not connect to the database. Please check your database settings.")
            return
        
        # Initialize database
        init_db()
        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

# Health check endpoint
@app.get(f"{settings.API_V1_STR}/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint to verify the API is running.
    """
    db = None
    try:
        # Check database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.commit()
        return {
            "status": "healthy",
            "database": "connected",
            "version": settings.VERSION
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unavailable. Database connection error: {str(e)}"
        )
    finally:
        if db:
            db.close()

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
