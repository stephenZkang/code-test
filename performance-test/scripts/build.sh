#!/bin/bash

# Build and Package Script
# This script builds the Spring Boot application and creates the final JAR

set -e

echo "=========================================="
echo "Spring Boot Performance Test Build Script"
echo "=========================================="

# Check Java version
echo "Checking Java version..."
java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$java_version" -lt 21 ]; then
    echo "❌ Error: Java 21 or higher is required!"
    echo "Current Java version: $(java -version 2>&1 | head -1)"
    exit 1
else
    echo "✅ Java version: $(java -version 2>&1 | head -1)"
fi

# Check Maven
echo "Checking Maven..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Error: Maven is not installed!"
    exit 1
else
    echo "✅ Maven version: $(mvn -version | head -1)"
fi

# Clean and compile
echo ""
echo "Cleaning and compiling..."
mvn clean compile

# Run tests (if any)
echo ""
echo "Running tests..."
mvn test

# Package application
echo ""
echo "Packaging application..."
mvn package -DskipTests

# Check if JAR was created
jar_file="target/performance-test-app.jar"
if [ -f "$jar_file" ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "📦 JAR file created: $jar_file"
    echo "📊 JAR size: $(du -h "$jar_file" | cut -f1)"
    echo ""
    echo "To run the application:"
    echo "  java -jar $jar_file"
    echo ""
    echo "Or use the run script:"
    echo "  ./scripts/run.sh"
    echo ""
else
    echo "❌ Error: JAR file was not created!"
    exit 1
fi

echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="