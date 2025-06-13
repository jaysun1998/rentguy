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

# Wait for database to be ready
echo "Checking database connection..."
MAX_RETRIES=30
RETRY_INTERVAL=2

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i of $MAX_RETRIES..."
    
    # Use postgres client to check if database is accepting connections
    if python -c "import psycopg2; psycopg2.connect(\"$DATABASE_URL\")" 2>/dev/null; then
        echo "Successfully connected to database!"
        break
    fi
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo "Could not connect to database after $MAX_RETRIES attempts. Exiting."
        exit 1
    fi
    
    echo "Database not ready yet. Waiting..."
    sleep $RETRY_INTERVAL
done

# Create database tables if they don't exist
echo "Initializing database schema..."
python -c "from app.db.base import Base, engine; Base.metadata.create_all(bind=engine)"

# Start uvicorn server
echo "Starting FastAPI application with Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
