@echo off
REM =================================================================
REM Windows Offline Docker Deployment Script
REM This script deploys the complete application stack offline
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Windows Offline Docker Deployment
echo ========================================
echo.

REM Check if Docker is available
echo Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker is not installed or not running
    echo Please install Docker Desktop for Windows and ensure it's running
    pause
    exit /b 1
)

REM Check if offline compose file exists
if not exist "docker-compose.offline.yml" (
    echo Error: docker-compose.offline.yml not found
    echo Please ensure you are in the correct directory
    pause
    exit /b 1
)

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.offline.yml down -v 2>nul

REM Pull or load required images
echo Preparing Docker images...
echo.

REM Check application image
docker images performance-test-app:offline >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Application image not found
    echo Please run build-offline.bat first
    pause
    exit /b 1
) else (
    echo Application image found: performance-test-app:offline
)

REM Load monitoring images if available
if exist "docker-images\prom.tar" (
    docker images prom/prometheus >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Loading Prometheus image...
        docker load -i "docker-images\prom.tar"
    )
) else (
    echo Prometheus image not available offline, will be pulled if needed
)

if exist "docker-images\grafana.tar" (
    docker images grafana/grafana >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Loading Grafana image...
        docker load -i "docker-images\grafana.tar"
    )
) else (
    echo Grafana image not available offline, will be pulled if needed
)

echo.
echo Starting offline Docker Compose...
echo -----------------------------------

REM Start the complete stack
docker-compose -f docker-compose.offline.yml up -d

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to start Docker Compose
    echo Check the error messages above for details
    pause
    exit /b 1
)

echo.
echo Waiting for services to start...
echo This may take 1-2 minutes...
echo.

REM Wait for application to be healthy
set MAX_WAIT=120
set WAIT_COUNT=0

:wait_loop
timeout /t 5 /nobreak >nul
set /a WAIT_COUNT+=5

curl -f -s http://localhost:8080/actuator/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    goto services_ready
)

if %WAIT_COUNT% geq %MAX_WAIT% (
    echo Timeout waiting for services to start
    goto show_status
)

echo Checking application health... (%WAIT_COUNT%s / %MAX_WAIT%s)
goto wait_loop

:services_ready
echo.
echo ========================================
echo Services are ready!
echo ========================================

:show_status
echo.
echo Checking service status...
echo ------------------------
docker-compose -f docker-compose.offline.yml ps

echo.
echo Service URLs:
echo -------------
echo Application: http://localhost:8080
echo Health Check: http://localhost:8080/actuator/health
echo Metrics: http://localhost:8080/actuator/prometheus

REM Check if monitoring services are running
docker-compose -f docker-compose.offline.yml ps | findstr "prometheus" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Prometheus: http://localhost:9090
)

docker-compose -f docker-compose.offline.yml ps | findstr "grafana" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Grafana: http://localhost:3000 ^(admin/admin^)
)

echo.
echo Application logs:
docker-compose -f docker-compose.offline.yml logs -f performance-test

pause