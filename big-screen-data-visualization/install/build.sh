#!/bin/bash
echo "Building Situational Dashboard..."

echo "[1/2] Building Backend..."
cd backend
pip install -r requirements.txt
echo "Backend dependencies installed."

echo "[2/2] Building Frontend..."
cd ../frontend
npm install
npm run build
echo "Frontend build complete."

echo "Build finished successfully."
