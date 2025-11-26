@echo off
echo ========================================
echo LearnEnglish - Database Setup Script
echo ========================================
echo.

REM Check if MySQL is accessible
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL not found in PATH
    echo Please install MySQL or add it to your PATH
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo.
    pause
    exit /b 1
)

echo [INFO] MySQL found
echo.

REM Prompt for MySQL password
set /p MYSQL_PASSWORD="Enter MySQL root password (default: root): "
if "%MYSQL_PASSWORD%"=="" set MYSQL_PASSWORD=root

echo.
echo [INFO] Creating database and tables...
mysql -h 127.0.0.1 -u root -p%MYSQL_PASSWORD% < database\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database schema
    pause
    exit /b 1
)

echo [SUCCESS] Database schema created
echo.

echo [INFO] Importing seed data...
mysql -h 127.0.0.1 -u root -p%MYSQL_PASSWORD% < database\seed.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to import seed data
    pause
    exit /b 1
)

echo [SUCCESS] Seed data imported
echo.

echo [INFO] Verifying database...
mysql -h 127.0.0.1 -u root -p%MYSQL_PASSWORD% -e "USE learn_english; SELECT COUNT(*) as word_count FROM words;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database verification failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Database setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Start the backend: cd learn-english-backend ^&^& mvn spring-boot:run
echo 2. Start the frontend: cd learn-english-frontend ^&^& npm run dev
echo 3. Visit: http://localhost:3000
echo.
pause
