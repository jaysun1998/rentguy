from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from urllib.parse import urlparse
from app.core.config import settings

# Use DATABASE_URL from settings
database_url = settings.DATABASE_URL

# Parse the URL to determine the database type
parsed_url = urlparse(database_url)

# Create engine with appropriate configuration
if parsed_url.scheme.startswith('sqlite'):
    engine = create_engine(
        database_url, connect_args={"check_same_thread": False}
    )
else:
    # For PostgreSQL and other databases, don't use check_same_thread
    engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Import all models to register them with SQLAlchemy
from app.models import *  # noqa

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()