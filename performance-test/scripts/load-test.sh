#!/bin/bash

# Load Testing Script for Spring Boot Performance Test Application
# This script runs load tests using Apache Bench (ab) for different QPS levels

set -e

# Default values
HOST="localhost"
PORT="8080"
DURATION=60  # seconds
CONCURRENT_USERS=100
WARMUP_TIME=10  # seconds

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

# QPS levels to test
QPS_LEVELS=(3000 5000 10000 20000 30000 50000)

# Function to print usage
print_usage() {
    echo "Usage: $0 [OPTIONS] [QPS_LEVEL]"
    echo "Options:"
    echo "  -h, --host HOST         Target host (default: localhost)"
    echo "  -p, --port PORT         Target port (default: 8080)"
    echo "  -d, --duration SECONDS  Test duration (default: 60)"
    echo "  -c, --concurrent USERS  Concurrent users (default: 100)"
    echo "  -w, --warmup SECONDS    Warmup time (default: 10)"
    echo "  -e, --endpoint ENDPOINT Specific endpoint to test"
    echo "  --all                   Test all QPS levels sequentially"
    echo "  --help                  Show this help message"
    echo ""
    echo "QPS Levels: 3000, 5000, 10000, 20000, 30000, 50000"
    echo ""
    echo "Examples:"
    echo "  $0 3000                           # Test 3000 QPS"
    echo "  $0 --all                          # Test all QPS levels"
    echo "  $0 -h example.com -p 9090 5000    # Test remote server"
    echo "  $0 -e '/api/tomcat/sleep/50ms' 10000  # Test specific endpoint"
}

# Function to check dependencies
check_dependencies() {
    if ! command -v ab &> /dev/null; then
        echo "Error: Apache Bench (ab) is not installed!"
        echo "Please install it:"
        echo "  Ubuntu/Debian: sudo apt-get install apache2-utils"
        echo "  CentOS/RHEL:   sudo yum install httpd-tools"
        echo "  macOS:         brew install apache2"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo "Error: curl is not installed!"
        exit 1
    fi
}

# Function to check if server is running
check_server() {
    local url="http://${HOST}:${PORT}/actuator/health"
    echo "Checking if server is running at ${url}..."
    
    if curl -f -s "$url" > /dev/null; then
        echo "✓ Server is running"
        return 0
    else
        echo "✗ Server is not responding at ${url}"
        echo "Please start the server first"
        exit 1
    fi
}

# Function to calculate requests per second
calculate_rps() {
    local qps=$1
    local duration=$2
    echo $((qps * duration))
}

# Function to run load test
run_load_test() {
    local qps=$1
    local endpoint=$2
    local url="http://${HOST}:${PORT}${endpoint}"
    local total_requests=$(calculate_rps $qps $DURATION)
    
    echo "=========================================="
    echo "Load Test Configuration"
    echo "=========================================="
    echo "Target URL:        $url"
    echo "QPS Level:         $qps"
    echo "Duration:         ${DURATION}s"
    echo "Concurrent Users:  $CONCURRENT_USERS"
    echo "Total Requests:   $total_requests"
    echo "Warmup Time:       ${WARMUP_TIME}s"
    echo "=========================================="
    
    # Create results directory
    local results_dir="results/$(date +%Y%m%d_%H%M%S)_qps${qps}"
    mkdir -p "$results_dir"
    
    # Warmup
    echo "Warming up for ${WARMUP_TIME}s..."
    timeout $WARMUP_TIME ab -n $((qps * WARMUP_TIME)) -c $CONCURRENT_USERS "$url" > /dev/null 2>&1 || true
    
    # Run actual test
    echo "Running load test..."
    local output_file="${results_dir}/$(basename ${endpoint//\//_})_qps${qps}.txt"
    
    ab -n $total_requests -c $CONCURRENT_USERS -g "${results_dir}/gnuplot_${endpoint//\//_}_qps${qps}.tsv" "$url" | tee "$output_file"
    
    # Extract key metrics
    local rps=$(grep "Requests per second" "$output_file" | awk '{print $4}')
    local mean_time=$(grep "Time per request.*mean" "$output_file" | awk '{print $4}')
    local failed=$(grep "Failed requests" "$output_file" | awk '{print $3}')
    
    echo ""
    echo "Test Results Summary:"
    echo "  Actual RPS:        $rps"
    echo "  Mean Response Time: ${mean_time}ms"
    echo "  Failed Requests:   $failed"
    echo "  Results saved to:  $results_dir"
    echo ""
    
    # Save summary
    cat >> "${results_dir}/summary.txt" << EOF
Endpoint: $endpoint
QPS Level: $qps
Actual RPS: $rps
Mean Response Time: ${mean_time}ms
Failed Requests: $failed
Test Date: $(date)
EOF
}

# Function to test all QPS levels
test_all_qps() {
    local endpoint=$1
    
    echo "Testing all QPS levels for endpoint: $endpoint"
    echo ""
    
    for qps in "${QPS_LEVELS[@]}"; do
        echo "Testing QPS: $qps"
        run_load_test $qps "$endpoint"
        echo ""
        
        # Brief pause between tests
        sleep 5
    done
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -d|--duration)
            DURATION="$2"
            shift 2
            ;;
        -c|--concurrent)
            CONCURRENT_USERS="$2"
            shift 2
            ;;
        -w|--warmup)
            WARMUP_TIME="$2"
            shift 2
            ;;
        -e|--endpoint)
            ENDPOINT="$2"
            shift 2
            ;;
        --all)
            TEST_ALL=true
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
        *)
            QPS_TARGET="$1"
            shift
            ;;
    esac
done

# Check dependencies
check_dependencies

# Check if server is running
check_server

# Set default endpoint if not specified
ENDPOINT=${ENDPOINT:-"/api/tomcat/sleep/100ms"}

# Run tests
if [ "$TEST_ALL" = true ]; then
    if [ -n "$QPS_TARGET" ]; then
        echo "Testing all endpoints at QPS: $QPS_TARGET"
        for endpoint in "${ENDPOINTS[@]}"; do
            run_load_test "$QPS_TARGET" "$endpoint"
            echo ""
            sleep 5
        done
    else
        echo "Testing all QPS levels for default endpoint: $ENDPOINT"
        test_all_qps "$ENDPOINT"
    fi
else
    QPS_TARGET=${QPS_TARGET:-3000}
    run_load_test "$QPS_TARGET" "$ENDPOINT"
fi

echo "Load testing completed!"
echo "Results are saved in the 'results/' directory"