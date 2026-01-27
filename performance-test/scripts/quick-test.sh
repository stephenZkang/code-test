#!/bin/bash

# Quick Performance Test Script
# This script runs quick tests to validate all endpoints

set -e

HOST="localhost"
PORT="8080"

# Available endpoints
ENDPOINTS=(
    "/api/tomcat/sleep/50ms"
    "/api/tomcat/sleep/100ms"
    "/api/tomcat/sleep/200ms"
    "/api/tomcat/sleep/500ms"
    "/api/tomcat/sleep/1s"
    "/api/virtual/sleep/50ms"
    "/api/virtual/sleep/100ms"
    "/api/virtual/sleep/200ms"
    "/api/virtual/sleep/500ms"
    "/api/virtual/sleep/1s"
    "/api/webflux/sleep/50ms"
    "/api/webflux/sleep/100ms"
    "/api/webflux/sleep/200ms"
    "/api/webflux/sleep/500ms"
    "/api/webflux/sleep/1s"
)

echo "Quick Performance Test"
echo "====================="

# Check if server is running
echo "Checking server connectivity..."
if ! curl -f -s "http://${HOST}:${PORT}/actuator/health" > /dev/null; then
    echo "❌ Server is not running at http://${HOST}:${PORT}"
    exit 1
fi
echo "✅ Server is running"

echo ""
echo "Testing all endpoints..."
echo ""

# Test each endpoint
for endpoint in "${ENDPOINTS[@]}"; do
    url="http://${HOST}:${PORT}${endpoint}"
    echo -n "Testing $endpoint ... "
    
    # Measure response time
    start_time=$(date +%s%N)
    response=$(curl -s -w "%{http_code}" "$url")
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        # Check if response contains expected fields
        if echo "$response_body" | grep -q "implementation"; then
            implementation=$(echo "$response_body" | grep -o '"implementation":"[^"]*"' | cut -d'"' -f4)
            thread_type=$(echo "$response_body" | grep -o '"threadType":"[^"]*"' | cut -d'"' -f4)
            echo "✅ ${response_time}ms (${implementation}, ${thread_type})"
        else
            echo "⚠️  ${response_time}ms (unexpected response format)"
        fi
    else
        echo "❌ HTTP $http_code"
    fi
done

echo ""
echo "Quick test completed!"