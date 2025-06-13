"""
Initialize the database with the required tables and initial data.
This script should be run once during the initial setup.
"""
import logging
from app.db.session import SessionLocal, engine, Base
from app.db.init_db import init_db as init_db_data

def main() -> None:
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("Initializing database with initial data...")
    db = SessionLocal()
    try:
        init_db_data(db)
        db.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
