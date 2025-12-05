#!/bin/bash
# test-error-alert.sh

echo "🔴 Testing HighErrorRate Alert..."
echo "================================="

echo "Generating errors (500, 404, 400)..."
for i in {1..50}; do
  # Generate different types of errors
  curl -s "http://localhost:3000/error/500" > /dev/null &
  curl -s "http://localhost:3000/error/404" > /dev/null &
  curl -s "http://localhost:3000/error/400" > /dev/null &
  
  # Every 10 requests, show progress
  if [ $((i % 10)) -eq 0 ]; then
    echo "   Sent $((i*3)) error requests..."
  fi
  
  sleep 0.1
done

echo ""
echo "✅ Error generation complete!"
echo "⚠️  HighErrorRate alert should fire in 2 minutes"
echo "📊 Check: http://localhost:3001/alerting"
echo "📈 Monitor error rate: http://localhost:9090/graph?g0.expr=rate(http_requests_total{status_code%3D~%225..%22}[5m])"