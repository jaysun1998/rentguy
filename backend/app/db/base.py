from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"  # Will be overridden by env var

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
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
