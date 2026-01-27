# Spring Boot Performance Test Application

A comprehensive performance testing application that compares three different Spring Boot implementations:
- Traditional Tomcat-based HTTP controllers
- Virtual Thread-based HTTP controllers (Java 21+)
- WebFlux reactive controllers

## 🚀 Features

- **Three Implementation Types**: Compare traditional threading, virtual threads, and reactive programming
- **Multiple Sleep Durations**: 50ms, 100ms, 200ms, 500ms, 1s endpoints
- **Performance Monitoring**: Built-in metrics with Prometheus integration
- **Load Testing**: Comprehensive test scripts for various QPS levels
- **Container Support**: Docker and Docker Compose configurations
- **Production Ready**: Health checks, proper logging, and deployment scripts

## 📋 Prerequisites

### Java Environment
- **Java 21+** (required for virtual threads)
- Maven 3.6+

### Load Testing Tools
- **Apache Bench (ab)** for basic load testing
- **WRK** for advanced load testing (recommended)
- **Curl** for health checks

### Optional (for monitoring)
- Docker and Docker Compose
- Prometheus and Grafana (included in docker-compose)

## 🛠️ Quick Start

### 1. Build the Application

```bash
# Clone and build
git clone <repository-url>
cd spring-boot-performance-test
mvn clean package

# Run the application
java -jar target/performance-test-app.jar
```

### 2. Quick Test

```bash
# Test all endpoints
./scripts/quick-test.sh

# Or on Windows
scripts\quick-test.bat
```

### 3. Load Testing

```bash
# Test with Apache Bench (3000 QPS)
./scripts/load-test.sh 3000

# Test all QPS levels
./scripts/load-test.sh --all

# Compare all implementations at 10000 QPS
./scripts/wrk-test.sh --compare 10000
```

## 🏗️ Project Structure

```
├── src/main/java/com/performance/test/
│   ├── PerformanceTestApplication.java     # Main application class
│   ├── controller/
│   │   ├── TomcatController.java           # Traditional servlet endpoints
│   │   ├── VirtualThreadController.java    # Virtual thread endpoints
│   │   └── WebFluxController.java         # Reactive endpoints
│   └── config/
│       └── VirtualThreadConfig.java        # Virtual thread configuration
├── src/main/resources/
│   └── application.properties              # Application configuration
├── scripts/                                # Deployment and testing scripts
│   ├── run.sh / run.bat                   # Application runners
│   ├── quick-test.sh                      # Quick endpoint validation
│   ├── load-test.sh                       # Apache Bench load testing
│   └── wrk-test.sh                        # Advanced WRK testing
├── monitoring/                             # Monitoring configurations
│   └── prometheus.yml                     # Prometheus config
├── Dockerfile                             # Container definition
├── docker-compose.yml                     # Full stack with monitoring
└── pom.xml                                # Maven configuration
```

## 📡 API Endpoints

### Traditional Tomcat Controllers
```
GET /api/tomcat/sleep/50ms
GET /api/tomcat/sleep/100ms
GET /api/tomcat/sleep/200ms
GET /api/tomcat/sleep/500ms
GET /api/tomcat/sleep/1s
```

### Virtual Thread Controllers
```
GET /api/virtual/sleep/50ms
GET /api/virtual/sleep/100ms
GET /api/virtual/sleep/200ms
GET /api/virtual/sleep/500ms
GET /api/virtual/sleep/1s
```

### WebFlux Reactive Controllers
```
GET /api/webflux/sleep/50ms
GET /api/webflux/sleep/100ms
GET /api/webflux/sleep/200ms
GET /api/webflux/sleep/500ms
GET /api/webflux/sleep/1s
```

### Management Endpoints
```
GET /actuator/health                       # Health check
GET /actuator/metrics                      # Application metrics
GET /actuator/prometheus                   # Prometheus metrics
```

## 🔧 Configuration

### Application Properties
- **Server Port**: 8080
- **Tomcat Threads**: Max 200, Min 10
- **Virtual Threads**: Enabled (Java 21+)
- **JVM Options**: -Xms2g -Xmx4g -XX:+UseG1GC

### Environment Variables
```bash
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=default
JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"
```

## 🧪 Load Testing

### Apache Bench Testing

```bash
# Test specific QPS
./scripts/load-test.sh 3000

# Test remote server
./scripts/load-test.sh -h example.com -p 9090 5000

# Test all QPS levels (3000, 5000, 10000, 20000, 30000, 50000)
./scripts/load-test.sh --all

# Test specific endpoint
./scripts/load-test.sh -e "/api/virtual/sleep/100ms" 10000
```

### WRK Advanced Testing

```bash
# Test with WRK (recommended)
./scripts/wrk-test.sh 3000

# Compare all implementations
./scripts/wrk-test.sh --compare 10000

# Custom configuration
./scripts/wrk-test.sh -t 16 -c 200 -d 120s 5000
```

### Expected QPS Levels
- **3000 QPS**: Light load
- **5000 QPS**: Moderate load
- **10000 QPS**: Heavy load
- **20000 QPS**: Very heavy load
- **30000 QPS**: Extreme load
- **50000 QPS**: Maximum test load

## 🐳 Docker Deployment

### Standalone Container
```bash
# Build image
docker build -t performance-test-app .

# Run container
docker run -p 8080:8080 performance-test-app
```

### Full Stack with Monitoring
```bash
# Start application with Prometheus and Grafana
docker-compose up -d

# Access services
# Application: http://localhost:8080
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

## 📊 Monitoring

### Metrics Available
- HTTP request counts and response times
- JVM memory and garbage collection
- Thread pool utilization
- System resource usage

### Grafana Dashboard
Import the provided dashboard or create custom visualizations using Prometheus metrics.

## 🔍 Performance Analysis

### Expected Behavior
1. **Tomcat**: Traditional blocking I/O, limited by thread pool size
2. **Virtual Threads**: Better resource utilization for I/O-bound workloads
3. **WebFlux**: Non-blocking reactive, best for high concurrency

### Key Metrics to Watch
- **Response Time (p50, p95, p99)**: Latency distribution
- **Throughput (QPS)**: Requests per second
- **Error Rate**: Failed requests percentage
- **Resource Usage**: CPU, memory, thread utilization

### Testing Results Interpretation
- **Low QPS (3000-5000)**: All implementations should perform similarly
- **Medium QPS (10000-20000)**: Virtual threads and WebFlux should start showing advantages
- **High QPS (30000+)**: WebFlux should outperform others in throughput and resource efficiency

## 🚨 Troubleshooting

### Common Issues

**Java Version Error**
```
Error: Java 21 or higher is required for virtual threads!
```
Solution: Install Java 21+ and set JAVA_HOME appropriately.

**Port Already in Use**
```
Error: Port 8080 is already in use
```
Solution: Change port with `-p 9090` option or kill existing process.

**Out of Memory**
```
OutOfMemoryError: Java heap space
```
Solution: Increase heap size with `-Xmx8g` JVM option.

**Load Testing Tool Not Found**
```
Error: wrk is not installed!
```
Solution: Install wrk using package manager or download from GitHub.

### Performance Issues

**High Latency at Low QPS**
- Check system resources (CPU, memory)
- Verify sleep times are as expected
- Monitor GC activity

**Thread Pool Exhaustion**
- Increase Tomcat thread pool size
- Check for blocking operations
- Consider using virtual threads or WebFlux

**Connection Timeouts**
- Increase connection timeout in client
- Check server capacity
- Monitor network conditions

## 📝 Development

### Adding New Endpoints
1. Add methods to appropriate controller class
2. Follow existing naming conventions
3. Include response metadata (thread info, timing)

### Modifying Sleep Durations
1. Update constants in controller classes
2. Add new endpoint mappings
3. Update load testing scripts if needed

### Adding Metrics
1. Use Micrometer annotations
2. Add custom metrics in controllers
3. Update Prometheus configuration

## 📄 License

This project is open source. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review application logs
3. Create GitHub issue with details
4. Include system specifications and test results