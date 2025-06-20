# Ultra-minimal Dockerfile for Railway deployment
FROM python:3.9-slim

WORKDIR /app

# Copy minimal requirements first (for better caching)
COPY backend/requirements.minimal.txt ./requirements.txt

# Install Python packages with minimal system dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip

# Copy backend code
COPY backend/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 8000

# Start the application directly
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]