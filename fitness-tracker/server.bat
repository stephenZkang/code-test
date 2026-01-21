@echo off
echo Starting Fitness Tracker Server...
echo.
echo Server will start on: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8000