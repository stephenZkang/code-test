@echo off
REM =================================================================
REM Windows Offline Docker Build Script
REM This script builds Docker images completely offline
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Windows Offline Docker Build Script
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
echo Docker: %DOCKER_VERSION%

REM Check if required files exist
echo.
echo Checking required files...
if not exist "Dockerfile.offline" (
    echo Error: Dockerfile.offline not found
    echo Please ensure you are in the correct directory
    pause
    exit /b 1
)

if not exist "maven-repo" (
    echo Error: maven-repo directory not found
    echo Please run download-offline-dependencies.bat first
    pause
    exit /b 1
)

if not exist "pom.xml" (
    echo Error: pom.xml not found
    echo Please ensure you are in the project root directory
    pause
    exit /b 1
)

echo [1/5] Loading Docker base images...
echo -----------------------------------------

REM Load base images if available
if exist "docker-images\openjdk.tar" (
    echo Loading OpenJDK base image...
    docker load -i "docker-images\openjdk.tar"
    if %ERRORLEVEL% equ 0 (
        echo OpenJDK image loaded successfully
    ) else (
        echo Warning: Failed to load OpenJDK image
    )
) else (
    echo OpenJDK image not found, will be pulled during build
)

echo.
echo [2/5] Building Spring Boot application image...
echo --------------------------------------------------

REM Build the application image using offline Dockerfile
docker build -f Dockerfile.offline -t performance-test-app:offline --no-cache .
if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Docker build failed
    echo Check the error messages above for details
    pause
    exit /b 1
)

echo Application image built successfully!

echo.
echo [3/5] Creating monitoring images...
echo ------------------------------------

REM Check if monitoring images are available
docker images prom/prometheus >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "docker-images\prom.tar" (
        echo Loading Prometheus image...
        docker load -i "docker-images\prom.tar"
        if %ERRORLEVEL% equ 0 (
            echo Prometheus image loaded successfully
        ) else (
            echo Warning: Failed to load Prometheus image
        )
    ) else (
        echo Prometheus image not found - will be pulled when needed
    )
) else (
    echo Prometheus image already available
)

docker images grafana/grafana >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "docker-images\grafana.tar" (
        echo Loading Grafana image...
        docker load -i "docker-images\grafana.tar"
        if %ERRORLEVEL% equ 0 (
            echo Grafana image loaded successfully
        ) else (
            echo Warning: Failed to load Grafana image
        )
    ) else (
        echo Grafana image not found - will be pulled when needed
    )
) else (
    echo Grafana image already available
)

echo.
echo [4/5] Verifying built images...
echo ---------------------------------

REM Verify the application image
docker images performance-test-app:offline
if %ERRORLEVEL% neq 0 (
    echo Error: Application image not found after build
    pause
    exit /b 1
)

echo.
echo [5/5] Creating network...
echo --------------------------

REM Create Docker network if it doesn't exist
docker network inspect performance-network >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Creating Docker network...
    docker network create performance-network
) else (
    echo Docker network already exists
)

echo.
echo ========================================
echo Offline Docker Build Completed!
echo ========================================
echo.
echo Built Images:
echo - performance-test-app:offline
echo - Monitoring images ^(if available^)
echo.
echo Next Steps:
echo 1. Test the application: docker run -p 8080:8080 performance-test-app:offline
echo 2. Start full stack: docker-compose -f docker-compose.offline.yml up -d
echo 3. View application: http://localhost:8080
echo.
echo Services will be available at:
echo - Application: http://localhost:8080
echo - Actuator Health: http://localhost:8080/actuator/health
echo - Prometheus: http://localhost:9090 ^(if using docker-compose^)
echo - Grafana: http://localhost:3000 ^(if using docker-compose^)
echo.

pause