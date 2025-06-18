from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from urllib.parse import urlparse
from app.core.config import settings

# Models will be imported at the end of the file to avoid circular imports

# Use DATABASE_URL from settings
database_url = settings.DATABASE_URL

# Parse the URL to determine the database type
parsed_url = urlparse(database_url)

# Create engine with appropriate configuration
if parsed_url.scheme.startswith('sqlite'):
    engine = create_engine(
        database_url, 
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    # For PostgreSQL and other databases
    engine = create_engine(
        database_url,
        pool_pre_ping=True,  # Enable connection health checks
        pool_size=10,        # Maintain a pool of up to 10 connections
        max_overflow=20,     # Allow up to 20 connections above pool_size
        pool_timeout=30,     # Wait up to 30 seconds for a connection
        pool_recycle=1800    # Recycle connections after 30 minutes
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models here to avoid circular imports
# This ensures all models are registered with SQLAlchemy
from app.models import *  # noqa