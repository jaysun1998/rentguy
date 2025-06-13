import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from urllib.parse import urlparse
from contextlib import contextmanager

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure connection pool
engine_args = {
    "poolclass": QueuePool,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "pool_recycle": 1800,  # Recycle connections after 30 minutes
    "pool_pre_ping": True,  # Enable connection health checks
}

# Create SQLAlchemy engine
if settings.DATABASE_URL.startswith('sqlite'):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        **engine_args
    )
else:
    # Add SSL mode for PostgreSQL if needed
    if settings.DATABASE_URL.startswith('postgresql'):
        engine = create_engine(
            settings.DATABASE_URL,
            **engine_args
        )
    else:
        engine = create_engine(settings.DATABASE_URL, **engine_args)

# Create a scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Base class for models
Base = declarative_base()
Base.query = SessionLocal.query_property()

@contextmanager
def get_db():
    """
    Dependency function that yields database sessions.
    Handles session lifecycle and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()

def init_db():
    """Initialize database tables and create default data."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise
