#!/bin/bash
# test-slow-alert.sh

echo "🐌 Testing SlowResponse Alert..."
echo "================================"

echo "Sending slow requests to /slow endpoint..."
echo "Each request takes 1-3 seconds"

# Send concurrent slow requests
for i in {1..30}; do
  curl -s "http://localhost:3000/slow" > /dev/null &
  
  if [ $((i % 5)) -eq 0 ]; then
    echo "   Sent $i slow requests..."
  fi
  
  # Stagger requests
  sleep 0.2
done

echo ""
echo "Waiting for all requests to complete..."
wait

echo ""
echo "✅ Slow requests completed!"
echo "⚠️  SlowResponse alert should fire if P95 > 1 second"
echo "📊 Check: http://localhost:3001/alerting"
echo "📈 Monitor response time: http://localhost:9090/graph?g0.expr=histogram_quantile(0.95%2C%20rate(http_request_duration_seconds_bucket[5m]))"