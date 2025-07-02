#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm ci --production
npm run build:ci

echo "Copying frontend to backend..."
cd ..
mkdir -p static
cp -r frontend/dist/* static/

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Build complete!"