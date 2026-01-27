#!/bin/bash

# Advanced Load Testing Script using wrk (Web Load Testing Tool)
# This script provides more sophisticated load testing capabilities

set -e

# Default values
HOST="localhost"
PORT="8080"
DURATION=60
THREADS=12
CONNECTIONS=100
SCRIPT_TIMEOUT=30

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
    echo "  -t, --threads THREADS   Number of threads (default: 12)"
    echo "  -c, --connections CONN  Max connections (default: 100)"
    echo "  -e, --endpoint ENDPOINT Specific endpoint to test"
    echo "  --all                   Test all QPS levels sequentially"
    echo "  --compare               Compare all implementations at same QPS"
    echo "  --help                  Show this help message"
    echo ""
    echo "QPS Levels: 3000, 5000, 10000, 20000, 30000, 50000"
    echo ""
    echo "Examples:"
    echo "  $0 3000                           # Test 3000 QPS"
    echo "  $0 --all                          # Test all QPS levels"
    echo "  $0 --compare 10000                 # Compare all implementations at 10000 QPS"
    echo "  $0 -h example.com -p 9090 5000    # Test remote server"
}

# Function to check dependencies
check_dependencies() {
    if ! command -v wrk &> /dev/null; then
        echo "Error: wrk is not installed!"
        echo "Please install it:"
        echo "  Ubuntu/Debian: sudo apt-get install wrk"
        echo "  CentOS/RHEL:   sudo yum install wrk"
        echo "  macOS:         brew install wrk"
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

# Function to create wrk Lua script for specific QPS
create_wrk_script() {
    local target_qps=$1
    local script_file="wrk_script_${target_qps}.lua"
    
    cat > "$script_file" << EOF
-- wrk Lua script for target QPS: $target_qps
target_qps = $target_qps
request_interval = 1000 / target_qps  -- milliseconds

counter = 0
start_time = os.time()

request = function()
    -- Calculate delay to maintain target QPS
    local elapsed = (os.time() - start_time) * 1000
    local expected_requests = math.floor(elapsed / request_interval)
    
    if counter >= expected_requests then
        -- We're ahead, wait a bit
        return wrk.thread.sleep(0.001)
    end
    
    counter = counter + 1
    return wrk.format("GET", wrk.path)
end

done = function(summary, latency, requests)
    -- Print custom summary
    print("\\n=== Custom Summary ===")
    print(string.format("Target QPS: %d", target_qps))
    print(string.format("Actual QPS: %.2f", requests.duration))
    print(string.format("Total Requests: %d", summary.requests))
    print(string.format("Duration: %.2fs", summary.duration))
    print(string.format("Latency Mean: %.2fms", latency.mean))
    print(string.format("Latency 50th: %.2fms", latency:percentile(50)))
    print(string.format("Latency 95th: %.2fms", latency:percentile(95)))
    print(string.format("Latency 99th: %.2fms", latency:percentile(99)))
    print("========================\\n")
end
EOF
    
    echo "$script_file"
}

# Function to run wrk load test
run_wrk_test() {
    local qps=$1
    local endpoint=$2
    local url="http://${HOST}:${PORT}${endpoint}"
    
    echo "=========================================="
    echo "WRK Load Test Configuration"
    echo "=========================================="
    echo "Target URL:        $url"
    echo "QPS Level:         $qps"
    echo "Duration:         ${DURATION}s"
    echo "Threads:           $THREADS"
    echo "Connections:       $CONNECTIONS"
    echo "=========================================="
    
    # Create results directory
    local results_dir="results/wrk_$(date +%Y%m%d_%H%M%S)_qps${qps}"
    mkdir -p "$results_dir"
    
    # Create wrk script
    local script_file=$(create_wrk_script $qps)
    
    # Run wrk test
    local output_file="${results_dir}/$(basename ${endpoint//\//_})_qps${qps}.txt"
    
    echo "Running WRK load test..."
    wrk -t$THREADS -c$CONNECTIONS -d${DURATION}s -s "$script_file" --timeout "$SCRIPT_TIMEOUT" --latency "$url" | tee "$output_file"
    
    # Clean up script
    rm -f "$script_file"
    
    echo "Results saved to: $results_dir"
    echo ""
}

# Function to compare all implementations
compare_implementations() {
    local qps=$1
    
    echo "Comparing all implementations at QPS: $qps"
    echo ""
    
    # Group endpoints by implementation
    local tomcat_endpoints=("/api/tomcat/sleep/50ms" "/api/tomcat/sleep/100ms" "/api/tomcat/sleep/200ms" "/api/tomcat/sleep/500ms" "/api/tomcat/sleep/1s")
    local virtual_endpoints=("/api/virtual/sleep/50ms" "/api/virtual/sleep/100ms" "/api/virtual/sleep/200ms" "/api/virtual/sleep/500ms" "/api/virtual/sleep/1s")
    local webflux_endpoints=("/api/webflux/sleep/50ms" "/api/webflux/sleep/100ms" "/api/webflux/sleep/200ms" "/api/webflux/sleep/500ms" "/api/webflux/sleep/1s")
    
    # Test each implementation
    echo "Testing Tomcat Implementation..."
    for endpoint in "${tomcat_endpoints[@]}"; do
        run_wrk_test "$qps" "$endpoint"
        sleep 5
    done
    
    echo "Testing Virtual Thread Implementation..."
    for endpoint in "${virtual_endpoints[@]}"; do
        run_wrk_test "$qps" "$endpoint"
        sleep 5
    done
    
    echo "Testing WebFlux Implementation..."
    for endpoint in "${webflux_endpoints[@]}"; do
        run_wrk_test "$qps" "$endpoint"
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
        -t|--threads)
            THREADS="$2"
            shift 2
            ;;
        -c|--connections)
            CONNECTIONS="$2"
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
        --compare)
            COMPARE_ALL=true
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
if [ "$COMPARE_ALL" = true ]; then
    QPS_TARGET=${QPS_TARGET:-10000}
    compare_implementations "$QPS_TARGET"
elif [ "$TEST_ALL" = true ]; then
    if [ -n "$QPS_TARGET" ]; then
        echo "Testing all endpoints at QPS: $QPS_TARGET"
        for endpoint in "${ENDPOINTS[@]}"; do
            run_wrk_test "$QPS_TARGET" "$endpoint"
            echo ""
            sleep 5
        done
    else
        echo "Testing all QPS levels for default endpoint: $ENDPOINT"
        for qps in "${QPS_LEVELS[@]}"; do
            echo "Testing QPS: $qps"
            run_wrk_test "$qps" "$ENDPOINT"
            echo ""
            sleep 5
        done
    fi
else
    QPS_TARGET=${QPS_TARGET:-3000}
    run_wrk_test "$QPS_TARGET" "$ENDPOINT"
fi

echo "WRK load testing completed!"
echo "Results are saved in the 'results/' directory"