@echo off
REM =================================================================
REM Windows Offline Dependency Downloader for Docker Build
REM This script downloads all necessary dependencies for offline Docker builds
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Windows Offline Dependency Downloader
echo ========================================
echo.

REM Configuration
set OFFLINE_DIR=offline-build
set MAVEN_REPO_DIR=%OFFLINE_DIR%\maven-repo
set DOCKER_IMAGES_DIR=%OFFLINE_DIR%\docker-images
set JAVA_VERSION=21
set BASE_IMAGES=openjdk:21-jdk-slim prom/prometheus:latest grafana/grafana:latest

REM Create directories
echo Creating offline build directories...
if not exist "%OFFLINE_DIR%" mkdir "%OFFLINE_DIR%"
if not exist "%MAVEN_REPO_DIR%" mkdir "%MAVEN_REPO_DIR%"
if not exist "%DOCKER_IMAGES_DIR%" mkdir "%DOCKER_IMAGES_DIR%"

echo [1/4] Downloading Maven dependencies...
echo ----------------------------------------

REM Download Maven dependencies
call mvn dependency:go-offline -Dmaven.repo.local="%MAVEN_REPO_DIR%" -B
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to download Maven dependencies
    exit /b 1
)

REM Download all project dependencies
echo Downloading all project dependencies...
call mvn dependency:copy-dependencies -Dmaven.repo.local="%MAVEN_REPO_DIR%" -DoutputDirectory="%MAVEN_REPO_DIR%" -B
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to copy Maven dependencies
    exit /b 1
)

echo.
echo [2/4] Downloading Docker base images...
echo ----------------------------------------

REM Check if Docker is available
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Warning: Docker not found. Skipping base image downloads.
    echo You will need to download base images manually on the target machine.
) else (
    REM Pull base images
    for %%i in (%BASE_IMAGES%) do (
        echo Pulling %%i...
        docker pull %%i
        if %ERRORLEVEL% neq 0 (
            echo Warning: Failed to pull %%i
        ) else (
            echo Saving %%i to tar file...
            docker save %%i -o "%DOCKER_IMAGES_DIR%\%%~ni.tar"
            if %ERRORLEVEL% neq 0 (
                echo Warning: Failed to save %%i
            )
        )
    )
)

echo.
echo [3/4] Downloading additional tools...
echo ----------------------------------------

REM Download curl binary for Windows (if not available)
curl --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Downloading curl for Windows...
    powershell -Command "Invoke-WebRequest -Uri 'https://curl.se/windows/dl-7.88.1/curl-7.88.1-win64-mingw.zip' -OutFile '%OFFLINE_DIR%\curl.zip'"
    if %ERRORLEVEL% equ 0 (
        echo Extracting curl...
        powershell -Command "Expand-Archive -Path '%OFFLINE_DIR%\curl.zip' -DestinationPath '%OFFLINE_DIR%\curl' -Force"
    )
)

echo.
echo [4/4] Creating offline build configuration...
echo ----------------------------------------------

REM Create offline Dockerfile
echo Creating offline Dockerfile...
(
echo # Offline Dockerfile - Use local Maven repository
echo FROM openjdk:21-jdk-slim
echo.
echo # Install curl for health checks
echo RUN apt-get update ^&^& apt-get install -y curl ^&^& rm -rf /var/lib/apt/lists/*
echo.
echo WORKDIR /app
echo.
echo # Create non-root user
echo RUN addgroup --system spring ^&^& adduser --system spring --ingroup spring
echo.
echo # Copy Maven repository from offline build context
echo COPY maven-repo /root/.m2/repository
echo.
echo # Copy source code
echo COPY src ./src
echo COPY pom.xml ./
echo COPY .mvn ./.mvn
echo.
echo # Build application using offline Maven repository
echo RUN ./mvnw clean package -DskipTests -o
echo.
echo # Copy the built JAR
echo COPY target/performance-test-app.jar app.jar
echo.
echo # Change ownership to non-root user
echo RUN chown spring:spring app.jar
echo.
echo # Switch to non-root user
echo USER spring
echo.
echo # Expose port
echo EXPOSE 8080
echo.
echo # Set JVM options
echo ENV JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"
echo.
echo # Health check
echo HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
echo     CMD curl -f http://localhost:8080/actuator/health ^|^| exit 1
echo.
echo # Run the application
echo ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
) > "%OFFLINE_DIR%\Dockerfile.offline"

REM Create offline build script
echo Creating offline build script...
(
echo @echo off
echo REM =================================================================
echo REM Windows Offline Docker Build Script
echo REM =================================================================
echo.
echo echo Building Docker image offline...
echo echo.
echo.
echo REM Check if Docker is available
echo docker --version ^>nul 2^>^&1
echo if %%ERRORLEVEL%% neq 0 ^(
echo     echo Error: Docker is not available or not running
echo     exit /b 1
echo ^)
echo.
echo REM Load base images if available
echo if exist "docker-images\openjdk.tar" ^(
echo     echo Loading OpenJDK base image...
echo     docker load -i "docker-images\openjdk.tar"
echo ^)
echo.
echo if exist "docker-images\prom.tar" ^(
echo     echo Loading Prometheus base image...
echo     docker load -i "docker-images\prom.tar"
echo ^)
echo.
echo if exist "docker-images\grafana.tar" ^(
echo     echo Loading Grafana base image...
echo     docker load -i "docker-images\grafana.tar"
echo ^)
echo.
echo REM Build the application image
echo echo Building performance-test-app image...
echo docker build -f Dockerfile.offline -t performance-test-app:offline .
echo.
echo if %%ERRORLEVEL%% equ 0 ^(
echo     echo.
echo     echo ========================================
echo     echo Offline Docker build completed successfully!
echo     echo ========================================
echo     echo.
echo     echo To run the container:
echo     echo   docker run -p 8080:8080 performance-test-app:offline
echo     echo.
echo     echo To run with docker-compose:
echo     echo   docker-compose -f docker-compose.offline.yml up -d
echo ^) else ^(
echo     echo.
echo     echo Error: Docker build failed
echo     exit /b 1
echo ^)
) > "%OFFLINE_DIR%\build-offline.bat"

REM Create offline docker-compose file
echo Creating offline docker-compose file...
(
echo version: '3.8'
echo.
echo services:
echo   performance-test:
echo     build:
echo       context: .
echo       dockerfile: Dockerfile.offline
echo     image: performance-test-app:offline
echo     ports:
echo       - "8080:8080"
echo     environment:
echo       - SPRING_PROFILES_ACTIVE=default
echo       - JAVA_OPTS=-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication
echo       - SERVER_PORT=8080
echo     healthcheck:
echo       test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
echo       interval: 30s
echo       timeout: 10s
echo       retries: 3
echo       start_period: 60s
echo     restart: unless-stopped
echo     networks:
echo       - performance-network
echo.
echo   prometheus:
echo     image: prom/prometheus:latest
echo     ports:
echo       - "9090:9090"
echo     volumes:
echo       - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
echo       - prometheus_data:/prometheus
echo     command:
echo       - '--config.file=/etc/prometheus/prometheus.yml'
echo       - '--storage.tsdb.path=/prometheus'
echo       - '--web.console.libraries=/etc/prometheus/console_libraries'
echo       - '--web.console.templates=/etc/prometheus/consoles'
echo       - '--storage.tsdb.retention.time=200h'
echo       - '--web.enable-lifecycle'
echo     networks:
echo       - performance-network
echo.
echo   grafana:
echo     image: grafana/grafana:latest
echo     ports:
echo       - "3000:3000"
echo     environment:
echo       - GF_SECURITY_ADMIN_PASSWORD=admin
echo     volumes:
echo       - grafana_data:/var/lib/grafana
echo       - ./monitoring/grafana:/etc/grafana/provisioning
echo     networks:
echo       - performance-network
echo.
echo volumes:
echo   prometheus_data:
echo   grafana_data:
echo.
echo networks:
echo   performance-network:
echo     driver: bridge
) > "%OFFLINE_DIR%\docker-compose.offline.yml"

REM Create offline deployment package script
echo Creating offline deployment package script...
(
echo @echo off
echo REM =================================================================
echo REM Create Offline Deployment Package
echo REM =================================================================
echo.
echo echo Creating offline deployment package...
echo echo.
echo.
echo REM Create deployment package directory
echo set DEPLOY_PACKAGE=performance-test-offline-%%date:~-4,4%%%%date:~-10,2%%%%date:~-7,2%%
echo if exist "%%DEPLOY_PACKAGE%%" rmdir /s /q "%%DEPLOY_PACKAGE%%"
echo mkdir "%%DEPLOY_PACKAGE%%"
echo.
echo REM Copy necessary files
echo echo Copying application files...
echo xcopy /E /I /Y src "%%DEPLOY_PACKAGE%%\src"
echo xcopy /Y pom.xml "%%DEPLOY_PACKAGE%%\"
echo xcopy /E /I /Y .mvn "%%DEPLOY_PACKAGE%%\.mvn"
echo xcopy /E /I /Y scripts "%%DEPLOY_PACKAGE%%\scripts"
echo xcopy /E /I /Y monitoring "%%DEPLOY_PACKAGE%%\monitoring"
echo.
echo REM Copy offline build files
echo echo Copying offline build files...
echo xcopy /Y Dockerfile.offline "%%DEPLOY_PACKAGE%%\"
echo xcopy /Y build-offline.bat "%%DEPLOY_PACKAGE%%\"
echo xcopy /Y docker-compose.offline.yml "%%DEPLOY_PACKAGE%%\"
echo.
echo REM Copy Maven repository
echo echo Copying Maven repository ^(this may take a while^)...
echo xcopy /E /I /Y maven-repo "%%DEPLOY_PACKAGE%%\maven-repo"
echo.
echo REM Copy Docker images if available
echo if exist "docker-images" ^(
echo     echo Copying Docker images...
echo     xcopy /E /I /Y docker-images "%%DEPLOY_PACKAGE%%\docker-images"
echo ^)
echo.
echo REM Create deployment instructions
echo echo Creating deployment instructions...
echo (
echo echo Offline Deployment Instructions
echo echo ==================================
echo echo.
echo echo 1. Copy the entire '%%DEPLOY_PACKAGE%%' directory to the target machine
echo echo 2. Ensure Docker is installed and running on the target machine
echo echo 3. Navigate to the package directory on the target machine
echo echo 4. Run: build-offline.bat
echo echo 5. Run: docker-compose -f docker-compose.offline.yml up -d
echo echo.
echo echo Services will be available at:
echo echo - Application: http://localhost:8080
echo echo - Prometheus: http://localhost:9090  
echo echo - Grafana: http://localhost:3000 ^(admin/admin^)
echo echo.
echo echo Troubleshooting:
echo echo - Ensure Docker Desktop is running
echo echo - Check that ports 8080, 9090, 3000 are available
echo echo - Verify Java 21+ is available in the Docker image
echo ^) ^> "%%DEPLOY_PACKAGE%%\README-OFFLINE.txt"
echo.
echo echo.
echo echo ========================================
echo echo Offline deployment package created!
echo echo Package location: %%DEPLOY_PACKAGE%%
echo echo ========================================
echo echo.
echo echo Copy the entire '%%DEPLOY_PACKAGE%%' directory to your target machine.
echo echo Follow the instructions in README-OFFLINE.txt for deployment.
) > "%OFFLINE_DIR%\create-deployment-package.bat"

echo.
echo ========================================
echo Offline dependency download completed!
echo ========================================
echo.
echo Offline build directory: %OFFLINE_DIR%
echo.
echo Next steps:
echo 1. Copy the entire '%OFFLINE_DIR%' directory to your offline machine
echo 2. On the offline machine, run: build-offline.bat
echo 3. Then run: docker-compose -f docker-compose.offline.yml up -d
echo.
echo Contents of offline directory:
dir /B "%OFFLINE_DIR%"

pause