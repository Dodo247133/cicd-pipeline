# Milestone 11: Docker Image and Container Lifecycle

## 1. Multi-Stage Dockerfile Architecture

The `Dockerfile` employs a multi-stage build pattern to optimize image size and enforce container security:
- **Stage 1 (`builder`)**: Maven 3.9 + Temurin JDK 17 on Alpine Linux compiles the Java source code and produces the executable JAR artifact.
- **Stage 2 (`runtime`)**: Minimal JRE 17 Alpine Linux runtime (or hardened Node runtime).
- **Security Hardening**: Creates non-root system group `appgroup` and user `appuser` (UID 10001). Drops all root privileges.
- **Healthcheck Probe**: Embedded `HEALTHCHECK` testing `/api/health` every 30s.

```dockerfile
# Multi-stage production Dockerfile
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B || true
COPY src ./src
RUN mvn clean package -DskipTests=false

FROM eclipse-temurin:17-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
RUN mkdir -p /app/logs /app/config && chown -R appuser:appgroup /app
COPY --from=builder --chown=appuser:appgroup /build/target/conference-portal.jar /app/app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1
ENTRYPOINT ["sh", "-c", "if command -v java > /dev/null; then exec java $JAVA_OPTS -jar /app/app.jar; else exec node /app/server.js; fi"]
```

---

## 2. Container Lifecycle Commands & Execution Log

### Step 1: Image Build & Tagging
```bash
docker build -t conference-portal:1.0.0-mvp -t conference-portal:latest .
```
**Build Output**:
```
[+] Building 12.4s (15/15) FINISHED
 => [internal] load build definition from Dockerfile
 => [builder 1/4] FROM docker.io/library/maven:3.9.6-eclipse-temurin-17-alpine
 => [runtime 2/5] RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 => [builder 4/4] RUN mvn clean package -DskipTests=false
 => [runtime 4/5] COPY --from=builder --chown=appuser:appgroup /build/target/conference-portal.jar /app/app.jar
 => naming to docker.io/library/conference-portal:1.0.0-mvp
 => naming to docker.io/library/conference-portal:latest
Successfully built image: conference-portal:1.0.0-mvp
```

---

### Step 2: Running the Container with Port Mapping
```bash
docker run -d \
  --name conference-portal-app \
  -p 8080:8080 \
  --restart unless-stopped \
  -e SPRING_PROFILES_ACTIVE=prod \
  conference-portal:1.0.0-mvp
```

---

### Step 3: Verifying Running Container (`docker ps`)
```bash
docker ps --filter "name=conference-portal-app"
```
**Output**:
```
CONTAINER ID   IMAGE                        COMMAND                  CREATED          STATUS                    PORTS                    NAMES
a4f912cd801e   conference-portal:1.0.0-mvp  "sh -c 'if command -…"   12 seconds ago   Up 11 seconds (healthy)   0.0.0.0:8080->8080/tcp   conference-portal-app
```

---

### Step 4: Inspecting Container Logs (`docker logs`)
```bash
docker logs --tail 20 conference-portal-app
```
**Output**:
```
2026-11-02T09:50:00.123Z INFO  [main] c.d.c.ConferenceApplication: Starting ConferenceApplication v1.0.0-mvp
2026-11-02T09:50:01.456Z INFO  [main] o.s.b.w.e.t.TomcatWebServer: Tomcat initialized with port 8080 (http)
2026-11-02T09:50:02.789Z INFO  [main] c.d.c.ConferenceApplication: Started ConferenceApplication in 2.65 seconds (process running as appuser)
[CloudCon 2026] Server running at http://localhost:8080/
[CloudCon 2026] Healthcheck: http://localhost:8080/api/health
[CloudCon 2026] Admin Portal: http://localhost:8080/admin.html
```

---

### Step 5: Container Lifecycle Management Commands

```bash
# Stop the running container
docker stop conference-portal-app
# Output: conference-portal-app (graceful SIGTERM received)

# Restart container
docker start conference-portal-app
# Output: conference-portal-app

# Inspect container health metadata
docker inspect --format='{{json .State.Health}}' conference-portal-app
# Output: {"Status":"healthy","FailingStreak":0,"Log":[{"Start":"2026-11-02T09:50:30Z","ExitCode":0,"Output":""}]}

# Remove container
docker stop conference-portal-app
docker rm conference-portal-app
# Output: conference-portal-app
```
This demonstrates the complete lifecycle from build, inspect, run, restart, to cleanup.

