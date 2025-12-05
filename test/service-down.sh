#!/bin/bash
# test-alert.sh

echo "🚨 Testing ServiceDown Alert..."
echo "================================"

echo "1. Stopping Express API..."
docker-compose stop express-app

echo "2. Waiting for alert to fire (2 minutes)..."
for i in {120..1}; do
  echo -ne "   ⏳ Time remaining: ${i}s\r"
  sleep 1
done
echo ""

echo "3. Alert should be FIRING now!"
echo "   📊 Check: http://localhost:3001/alerting"
echo "   Look for 'ServiceDown' in CRITICAL state"

echo ""
echo "4. Restarting service..."
docker-compose start express-app

echo "5. Waiting for alert to resolve..."
sleep 30
echo "   ✅ Alert should now be RESOLVED"