# Multi-stage production-grade Dockerfile for Conference Registration Portal
# Stage 1: Build & Package Environment
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Optimize layer caching by copying pom.xml first
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source tree and compile/package artifact
COPY src ./src
RUN mvn clean package -DskipTests=false

# Stage 2: Hardened, Minimal Runtime Environment
FROM eclipse-temurin:17-jre-alpine AS runtime

# Security: Create non-root system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create deployment and log directories
WORKDIR /app
RUN mkdir -p /app/logs /app/config && \
    chown -R appuser:appgroup /app

# Copy executable jar from builder stage
COPY --from=builder --chown=appuser:appgroup /build/target/conference-portal.jar /app/app.jar

# Fallback: support Node-based runtime if running in lightweight container mode
COPY --chown=appuser:appgroup server.js package.json /app/
COPY --chown=appuser:appgroup src/main/resources/static/ /app/src/main/resources/static/

USER appuser

# Expose HTTP port
EXPOSE 8080

# Configure production JVM flags
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SERVER_PORT=8080

# Container Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Launch application
ENTRYPOINT ["sh", "-c", "if command -v java > /dev/null; then exec java $JAVA_OPTS -jar /app/app.jar; else exec node /app/server.js; fi"]

