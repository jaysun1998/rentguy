# This file makes the db directory a Python package
# Import database initialization functions
from .init_db import init_db as init_db_data
from .session import init_db as init_db_schema, get_db, SessionLocal, Base, engine

# Re-export for easier imports
__all__ = [
    'init_db_data',  # Initialize database with default data
    'init_db_schema',  # Initialize database schema
    'get_db',         # Database session dependency
    'SessionLocal',   # Database session factory
    'Base',           # SQLAlchemy Base class for models
    'engine'          # Database engine
]

def init_db():
    """Initialize both schema and data."""
    init_db_schema()
    init_db_data()
