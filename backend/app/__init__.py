"""
RentGuy Backend Application

This package initializes the RentGuy backend application, setting up logging,
configuration, and database connections.
"""
import logging
import os
from logging.handlers import RotatingFileHandler

from app.core.config import settings

# Configure logging
log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
log_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(log_level)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_format)
root_logger.addHandler(console_handler)

# File handler
file_handler = RotatingFileHandler(
    'logs/rentguy.log',
    maxBytes=1024 * 1024 * 5,  # 5MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setFormatter(log_format)
root_logger.addHandler(file_handler)

# Set SQLAlchemy log level
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
logging.getLogger('sqlalchemy.pool').setLevel(logging.WARNING)

# Package metadata
__version__ = "0.1.0"
__all__ = ["settings"]

# Initialize database on import
from app.db import init_db  # noqa: E402

try:
    init_db()
    logging.info("Database initialization completed")
except Exception as e:
    logging.error(f"Error initializing database: {e}")
    raise

# Import API router after database initialization
from app.api.api_v1.api import api_router  # noqa: E402

# Add API router to FastAPI app
from fastapi import FastAPI  # noqa: E402

app = FastAPI(
    title="RentGuy API",
    description="Property Management System API",
    version=__version__
)
app.include_router(api_router, prefix=settings.API_V1_STR)
