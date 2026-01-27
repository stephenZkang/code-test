@echo off
REM Spring Boot Performance Test Application Runner for Windows
REM This script runs the performance test application with different configurations

setlocal enabledelayedexpansion

REM Default values
set APP_JAR=performance-test-app.jar
set DEFAULT_PORT=8080
set DEFAULT_PROFILE=default
set JVM_OPTS=-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication

REM Function to print usage
:print_usage
echo Usage: %0 [OPTIONS]
echo Options:
echo   -p, --port PORT       Server port (default: 8080)
echo   -j, --jar FILE        JAR file path (default: performance-test-app.jar)
echo   -f, --profile PROFILE Spring profile (default: default)
echo   --jvm-opts OPTIONS    JVM options (default: -Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication)
echo   -h, --help           Show this help message
echo.
echo Examples:
echo   %0                           # Run with defaults
echo   %0 -p 9090                   # Run on port 9090
echo   %0 -j target\app.jar         # Run specific JAR
echo   %0 --jvm-opts "-Xms4g -Xmx8g"  # Custom JVM options
goto :eof

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="-p" (
    set PORT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-j" (
    set APP_JAR=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--jar" (
    set APP_JAR=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-f" (
    set PROFILE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--profile" (
    set PROFILE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--jvm-opts" (
    set JVM_OPTS=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :print_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :print_usage
    exit /b 0
)
echo Unknown option: %~1
call :print_usage
exit /b 1

:args_done

REM Set defaults if not provided
if "%PORT%"=="" set PORT=%DEFAULT_PORT%
if "%PROFILE%"=="" set PROFILE=%DEFAULT_PROFILE%

REM Check if JAR file exists
if not exist "%APP_JAR%" (
    echo Error: JAR file '%APP_JAR%' not found!
    echo Please build the application first: mvn clean package
    exit /b 1
)

REM Check if Java 21+ is available
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr "version"') do set JAVA_VERSION=%%i
set JAVA_VERSION=%JAVA_VERSION:"=%
for /f "tokens=1,2 delims=." %%a in ("%JAVA_VERSION%") do (
    set MAJOR_VERSION=%%a
    set MINOR_VERSION=%%b
)

if %MAJOR_VERSION% LSS 21 (
    echo Error: Java 21 or higher is required for virtual threads!
    echo Current Java version: %JAVA_VERSION%
    exit /b 1
)

echo ==========================================
echo Spring Boot Performance Test Runner
echo ==========================================
echo JAR File:        %APP_JAR%
echo Port:            %PORT%
echo Profile:         %PROFILE%
echo JVM Options:     %JVM_OPTS%
echo Java Version:    %JAVA_VERSION%
echo ==========================================

REM Export environment variables
set SERVER_PORT=%PORT%
set SPRING_PROFILES_ACTIVE=%PROFILE%

REM Run the application
java %JVM_OPTS% -jar "%APP_JAR%"