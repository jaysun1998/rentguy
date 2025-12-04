# Multi-stage Dockerfile for RentGuy with Nginx
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies including Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend build from stage 1 to static directory
COPY --from=frontend-build /app/frontend/dist /app/static

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Create supervisor configuration
RUN printf '[supervisord]\n\
nodaemon=true\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:fastapi]\n\
command=uvicorn app.main:app --host 127.0.0.1 --port 8000\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
echo "RentGuy Backend Startup with Nginx"\n\
echo "Environment: ${ENVIRONMENT:-development}"\n\
\n\
# Initialize database if needed\n\
python -c "\n\
import logging\n\
from app.db.base import Base, engine\n\
from app.startup import init_db\n\
\n\
logging.basicConfig(level=logging.INFO)\n\
logger = logging.getLogger(__name__)\n\
\n\
try:\n\
    logger.info('Creating database tables...')\n\
    Base.metadata.create_all(bind=engine)\n\
    logger.info('Initializing database data...')\n\
    init_db()\n\
    logger.info('Database initialization complete')\n\
except Exception as e:\n\
    logger.warning(f'Database initialization warning: {e}')\n\
"\n\
\n\
# Start supervisor to run both Nginx and FastAPI\n\
echo "Starting Nginx and FastAPI with supervisor..."\n\
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf\n' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose port (Nginx listens on 8080)
EXPOSE 8080

# Run startup script
CMD ["/app/start.sh"]
