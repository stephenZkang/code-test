#!/bin/bash

# Spring Boot Performance Test Application Runner
# This script runs the performance test application with different configurations

set -e

# Default values
APP_JAR="performance-test-app.jar"
DEFAULT_PORT=8080
DEFAULT_PROFILE="default"
JVM_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"

# Function to print usage
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -p, --port PORT       Server port (default: 8080)"
    echo "  -j, --jar FILE        JAR file path (default: performance-test-app.jar)"
    echo "  -f, --profile PROFILE Spring profile (default: default)"
    echo "  --jvm-opts OPTIONS    JVM options (default: -Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run with defaults"
    echo "  $0 -p 9090                   # Run on port 9090"
    echo "  $0 -j target/app.jar         # Run specific JAR"
    echo "  $0 --jvm-opts \"-Xms4g -Xmx8g\"  # Custom JVM options"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -j|--jar)
            APP_JAR="$2"
            shift 2
            ;;
        -f|--profile)
            PROFILE="$2"
            shift 2
            ;;
        --jvm-opts)
            JVM_OPTS="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Set defaults if not provided
PORT=${PORT:-$DEFAULT_PORT}
PROFILE=${PROFILE:-$DEFAULT_PROFILE}

# Check if JAR file exists
if [ ! -f "$APP_JAR" ]; then
    echo "Error: JAR file '$APP_JAR' not found!"
    echo "Please build the application first: mvn clean package"
    exit 1
fi

# Check if Java 21+ is available
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo "Error: Java 21 or higher is required for virtual threads!"
    echo "Current Java version: $(java -version 2>&1 | head -1)"
    exit 1
fi

echo "=========================================="
echo "Spring Boot Performance Test Runner"
echo "=========================================="
echo "JAR File:        $APP_JAR"
echo "Port:            $PORT"
echo "Profile:         $PROFILE"
echo "JVM Options:     $JVM_OPTS"
echo "Java Version:    $(java -version 2>&1 | head -1)"
echo "=========================================="

# Export environment variables
export SERVER_PORT=$PORT
export SPRING_PROFILES_ACTIVE=$PROFILE

# Run the application
exec java $JVM_OPTS -jar "$APP_JAR"