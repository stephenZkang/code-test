# Use a multi-stage build for better layer caching
FROM openjdk:21-jdk-slim as builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM openjdk:21-jdk-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Copy the built JAR
COPY --from=builder /app/target/performance-test-app.jar app.jar

# Change ownership to non-root user
RUN chown spring:spring app.jar

# Set proper file permissions
RUN chmod +x /app/app.jar

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]