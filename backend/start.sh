#!/bin/bash
# RentGuy Backend Startup Script
# Following Semantic Seed Venture Studio Coding Standards V2.0

set -e

# Log startup information
echo "Starting RentGuy Backend API"
echo "Environment: Production"
echo "Timestamp: $(date)"

# Wait for database to be ready (important for container orchestration)
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
