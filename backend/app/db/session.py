import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from urllib.parse import urlparse

try:
    from app.core.config import settings
except Exception as e:
    # Fallback configuration if settings can't be loaded
    class FallbackSettings:
        DATABASE_URL = "sqlite:///./rentguy.db"
        LOG_LEVEL = "INFO"
    
    settings = FallbackSettings()
    logging.warning(f"Using fallback settings due to config error: {e}")

logger = logging.getLogger(__name__)

try:
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
        logger.info("Created SQLite engine")
    else:
        # Add SSL mode for PostgreSQL if needed
        if settings.DATABASE_URL.startswith('postgresql'):
            engine = create_engine(
                settings.DATABASE_URL,
                **engine_args
            )
            logger.info("Created PostgreSQL engine")
        else:
            engine = create_engine(settings.DATABASE_URL, **engine_args)
            logger.info("Created database engine")
except Exception as e:
    logger.error(f"Error creating database engine: {e}")
    # Create a fallback SQLite engine
    engine = create_engine(
        "sqlite:///./fallback.db",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    logger.warning("Using fallback SQLite database")

# Create a scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Import Base from base_class to avoid duplicates
from app.db.base_class import Base

def get_db():
    """
    Dependency function that yields database sessions.
    Handles session lifecycle and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
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
