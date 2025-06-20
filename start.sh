#!/bin/bash
# RentGuy Root Startup Script
# Following Semantic Seed Venture Studio Coding Standards V2.0

set -e

# Log startup information
echo "Starting RentGuy Application"
echo "Environment: Production"
echo "Timestamp: $(date)"

# List current directory to help with debugging
echo "Current directory contents:"
ls -la

# Check if backend directory exists
if [ -d "backend" ]; then
    echo "Found backend directory"
    cd backend
elif [ -d "/app/backend" ]; then
    echo "Found /app/backend directory"
    cd /app/backend
else
    echo "ERROR: Cannot find backend directory"
    echo "Current directory: $(pwd)"
    echo "Contents:"
    ls -la
    exit 1
fi

# Check database connection (but don't fail if it's not ready)
echo "Checking database connection..."
python -c "
import os
import sys

# Force SQLite for Railway deployment
os.environ['DATABASE_URL'] = 'sqlite:///./rentguy.db'
database_url = 'sqlite:///./rentguy.db'
print(f'Using database: {database_url}')
print('Using SQLite database - no connection check needed')
"

# Initialize database schema and data
echo "Initializing database..."
python -c "
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    logger.info('Starting database initialization...')
    
    # Import database components
    from app.db.base import Base, engine
    from app.startup import init_db
    
    logger.info('Creating database tables...')
    Base.metadata.create_all(bind=engine)
    logger.info('Database tables created successfully')
    
    logger.info('Initializing database data...')
    init_db()
    logger.info('Database initialization completed successfully')
    
except Exception as e:
    logger.error(f'Database initialization error: {e}')
    logger.info('Continuing startup anyway - health endpoint will show status')

print('Database initialization phase complete')
"

# Start uvicorn server
echo "Starting FastAPI application with Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
