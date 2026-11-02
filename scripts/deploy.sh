#!/bin/bash
# Standalone deployment script for Conference Registration Portal
ENV="${1:-production}"
PORT="${2:-8080}"
APP_DIR="/opt/conference-portal"

echo "=========================================="
echo " Deploying Conference Portal to $ENV (Port $PORT)"
echo "=========================================="

mkdir -p "$APP_DIR/backups" "$APP_DIR/logs"

# Backup current running version
if [ -f "$APP_DIR/app.jar" ]; then
    echo "Creating backup of current active binary..."
    cp "$APP_DIR/app.jar" "$APP_DIR/backups/app-previous.jar"
fi

# Copy newly built artifact
if [ -f "target/conference-portal.jar" ]; then
    cp target/conference-portal.jar "$APP_DIR/app.jar"
fi

# Restart service or launch background daemon
if command -v systemctl >/dev/null 2>&1; then
    systemctl restart conference-portal
else
    echo "Starting app via node/java runtime..."
    pkill -f "conference-portal" || true
    nohup node server.js > "$APP_DIR/logs/app.log" 2>&1 &
fi

echo "Deployment complete. Executing health verification..."
./scripts/healthcheck.sh "http://localhost:$PORT/api/health"

