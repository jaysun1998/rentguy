#!/bin/bash
set -e

# Set environment variables
export PYTHONPATH=/app

echo "RentGuy Backend Startup - Railway Deployment"
echo "Current directory: $(pwd)"
echo "Environment check:"
echo "- DATABASE_URL: ${DATABASE_URL:-'Not set'}"
echo "- SECRET_KEY: ${SECRET_KEY:-'Not set'}"

# Function to check if database is ready
wait_for_db() {
    echo "Checking database connection..."
    
    # If we have a DATABASE_URL (Railway style), use it
    if [ -n "$DATABASE_URL" ]; then
        echo "Using DATABASE_URL for connection check"
        # Extract host from DATABASE_URL for basic connectivity check
        # For Railway, we'll just try to connect via Python instead of psql
        python -c "
import os
import time
import psycopg2
from urllib.parse import urlparse

database_url = os.environ.get('DATABASE_URL')
if database_url:
    max_retries = 30
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(database_url)
            conn.close()
            print(f'Database connection successful on attempt {i+1}')
            break
        except Exception as e:
            print(f'Attempt {i+1}/{max_retries}: Database not ready ({e})')
            if i < max_retries - 1:
                time.sleep(2)
            else:
                print('Warning: Could not connect to database, continuing anyway...')
else:
    print('No DATABASE_URL found, assuming SQLite fallback')
"
    else
        echo "No DATABASE_URL found, will use SQLite fallback"
    fi
}

# Function to create database tables and initialize
init_database() {
    echo "Initializing database..."
    cd /app
    
    python -c "
import sys
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
    logger.info('Continuing startup anyway - app will handle database issues')

print('Database initialization complete')
"
}

# Main execution
echo "Starting RentGuy backend initialization..."

# Check database connection
wait_for_db

# Initialize database
init_database

# Start the application
echo "Starting FastAPI application..."
echo "Health check will be available at: /api/v1/health"
echo "API documentation at: /api/v1/docs"

exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
