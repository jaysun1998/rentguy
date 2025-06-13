#!/bin/bash
set -e

# Set environment variables
export PYTHONPATH=/app

# Function to check if database is ready
wait_for_db() {
    echo "Waiting for PostgreSQL to be ready..."
    until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
        >&2 echo "PostgreSQL is unavailable - sleeping"
        sleep 5
    done
    echo "PostgreSQL is up and running!"
}

# Function to create database tables
create_tables() {
    echo "Creating database tables..."
    cd /app
    python -c "
import sys
from app.db.base import Base
from app.db.session import engine

print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"
}

# Function to initialize the database
init_database() {
    echo "Initializing database..."
    cd /app
    
    # Create database tables first
    create_tables
    
    # Then run database initialization script
    if [ -f "init_db.py" ]; then
        echo "Running database initialization..."
        python init_db.py
    else
        echo "Error: init_db.py not found!"
        exit 1
    fi
    
    # Run Alembic migrations if available
    if [ -f "alembic.ini" ]; then
        echo "Running database migrations..."
        alembic upgrade head
    else
        echo "No alembic.ini found, skipping migrations"
    fi
}

# Function to check if database needs initialization
needs_initialization() {
    # Check if the users table exists
    local count=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';" 2>/dev/null || echo "0")
    
    if [ "$count" -eq "0" ]; then
        echo "Database needs initialization"
        return 0
    else
        echo "Database already initialized"
        return 1
    fi
}

# Main execution
wait_for_db

# Always ensure tables exist
create_tables

# Check if database needs initialization
if needs_initialization; then
    echo "Initializing database with default data..."
    init_database
else
    echo "Skipping database initialization - already set up"
    
    # Still run migrations on existing database
    if [ -f "alembic.ini" ]; then
        echo "Running database migrations..."
        alembic upgrade head
    fi
fi

# Start the application
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
