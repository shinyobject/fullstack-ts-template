#!/bin/bash

# Health Check Script
# Verifies the application is running correctly after deployment

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Configuration
M1_SSH_HOST="${M1_SSH_HOST:-user@m1-mac-mini.local}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/api/health}"
MAX_RETRIES="${HEALTH_CHECK_RETRIES:-5}"
RETRY_DELAY="${HEALTH_CHECK_DELAY:-3}"

echo "🏥 Running health check..."
echo "Target: $HEALTH_URL"
echo ""

# Function to check health on M1
check_health() {
  ssh "$M1_SSH_HOST" "curl -s -f -m 5 $HEALTH_URL" > /dev/null 2>&1
  return $?
}

# Retry loop
ATTEMPT=1
while [ $ATTEMPT -le $MAX_RETRIES ]; do
  echo "Attempt $ATTEMPT of $MAX_RETRIES..."

  if check_health; then
    echo ""
    echo "✅ Health check passed!"
    echo ""

    # Get health response details
    HEALTH_RESPONSE=$(ssh "$M1_SSH_HOST" "curl -s $HEALTH_URL")
    echo "Response: $HEALTH_RESPONSE"
    exit 0
  else
    if [ $ATTEMPT -lt $MAX_RETRIES ]; then
      echo "❌ Health check failed. Retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  fi

  ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "❌ Health check failed after $MAX_RETRIES attempts!"
echo ""
echo "Troubleshooting:"
echo "1. Check if the app is running: ssh $M1_SSH_HOST 'pm2 status'"
echo "2. View logs: ssh $M1_SSH_HOST 'pm2 logs todo-app --lines 50'"
echo "3. Check port 3001 is accessible: ssh $M1_SSH_HOST 'lsof -i :3001'"

exit 1
