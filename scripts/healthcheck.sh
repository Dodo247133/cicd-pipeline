#!/bin/bash
# Health check probe script for Linux/macOS environments
URL="${1:-http://localhost:8080/api/health}"
MAX_RETRIES="${2:-6}"
DELAY="${3:-3}"

echo "=========================================="
echo " Probing Application Health: $URL"
echo "=========================================="

for ((i=1; i<=MAX_RETRIES; i++)); do
    echo "Attempt $i/$MAX_RETRIES..."
    RESPONSE=$(curl -sSf -m 5 "$URL" 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ [SUCCESS] Health Check Passed!"
        echo "Response: $RESPONSE"
        exit 0
    fi
    sleep "$DELAY"
done

echo "❌ [ERROR] Health Check Failed after $MAX_RETRIES attempts!"
exit 1
