#!/bin/bash
# Emergency rollback script to previous stable release
APP_DIR="/opt/conference-portal"

echo "=========================================="
echo " INITIATING EMERGENCY ROLLBACK PROCEDURE"
echo "=========================================="

if [ ! -f "$APP_DIR/backups/app-previous.jar" ]; then
    echo "❌ No previous backup found at $APP_DIR/backups/app-previous.jar! Cannot rollback."
    exit 1
fi

echo "Restoring previous stable binary..."
cp "$APP_DIR/backups/app-previous.jar" "$APP_DIR/app.jar"

if command -v systemctl >/dev/null 2>&1; then
    systemctl restart conference-portal
fi

echo "Verifying health post-rollback..."
./scripts/healthcheck.sh "http://localhost:8080/api/health"

if [ $? -eq 0 ]; then
    echo "✅ [RECOVERED] Successfully rolled back to previous stable release baseline!"
    exit 0
else
    echo "❌ [FATAL] Rollback failed health check!"
    exit 1
fi
