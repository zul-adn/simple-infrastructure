const express = require('express');
const client = require('prom-client');

// Initialize Prometheus Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ========== ALL REQUIRED METRICS ==========  

// 1. REQUESTS PER SECOND
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// 2. LATENCY 
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 1.5, 2, 5]
});

// 3. AVERAGE RESPONSE TIME
const httpRequestDurationSummary = new client.Summary({
  name: 'http_request_duration_summary_seconds',
  help: 'Summary of HTTP request durations in seconds',
  labelNames: ['method', 'route', 'status_code'],
  percentiles: [0.5, 0.95, 0.99] // 50th (median), 95th, 99th percentiles
});

// 4. In-Progress Requests Gauge
const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently in progress',
  labelNames: ['method', 'route']
});

// 5. Error Counter 
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors (4xx, 5xx)',
  labelNames: ['method', 'route', 'status_code']
});

// Register all metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestDurationSummary);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(httpErrorsTotal);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// ========== MIDDLEWARE TO CAPTURE ALL METRICS ==========
app.use((req, res, next) => {
  const start = process.hrtime();
  
  // Track in-progress requests 
  httpRequestsInProgress.inc({ method: req.method, route: req.path });
  
  // Hook to response finish
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    // Decrement in-progress requests
    httpRequestsInProgress.dec({ method: req.method, route: req.path });
    
    // 1. Record request duration for histogram (latency)
    httpRequestDurationSeconds
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(durationInSeconds);
    
    // 2. Record request duration for summary (average)
    httpRequestDurationSummary
      .labels(req.method, req.path, res.statusCode.toString())
      .observe(durationInSeconds);
    
    // 3. Increment total requests counter (for requests per second)
    httpRequestsTotal
      .labels(req.method, req.path, res.statusCode.toString())
      .inc();
    
    // 4. Track errors if any
    if (res.statusCode >= 400) {
      httpErrorsTotal
        .labels(req.method, req.path, res.statusCode.toString())
        .inc();
    }
  });
  
  next();
});

// ========== ROUTES ==========

// API GET: /hello
app.get('/hello', (req, res) => {
  res.status(200).json({ 
    message: 'Hello High Load System',
    status: 200,
    timestamp: new Date().toISOString(),
    metrics_available: '/metrics'
  });
});

// API GET: / (root)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to High Load System API',
    status: 200,
    endpoints: [
      '/hello',
      '/health',
      '/metrics',
      '/fast',
      '/slow',
      '/error/:code?'
    ],
    monitoring: {
      requests_per_second: 'rate(http_requests_total[5m])',
      average_response_time: 'rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])',
      latency_p95: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'high-load-system',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics_endpoint: '/metrics'
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoints dengan berbagai response times
app.get('/slow', async (req, res) => {
  const delay = Math.floor(Math.random() * 3000) + 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  res.json({ 
    message: 'Slow endpoint', 
    delay: `${delay}ms`,
    type: 'simulated_delay',
    timestamp: new Date().toISOString()
  });
});

app.get('/fast', (req, res) => {
  res.json({ 
    message: 'Fast endpoint', 
    delay: '0ms',
    type: 'instant_response',
    timestamp: new Date().toISOString()
  });
});

// Error simulation endpoint
app.get('/error/:code?', (req, res) => {
  const errorCode = parseInt(req.params.code) || 500;
  res.status(errorCode).json({
    error: true,
    code: errorCode,
    message: `Simulated ${errorCode} error`,
    timestamp: new Date().toISOString()
  });
});

// Stress test endpoint (CPU intensive)
app.get('/cpu-intensive', (req, res) => {
  let result = 0;
  // Simulate CPU-intensive task
  for (let i = 0; i < 10000000; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  res.json({
    message: 'CPU intensive task completed',
    result: result.toFixed(2),
    timestamp: new Date().toISOString()
  });
});

// Memory intensive endpoint
app.get('/memory-intensive', (req, res) => {
  const largeArray = [];
  // Allocate some memory
  for (let i = 0; i < 100000; i++) {
    largeArray.push({ 
      id: i, 
      data: 'x'.repeat(100),
      timestamp: new Date().toISOString()
    });
  }
  res.json({
    message: 'Memory intensive task',
    arraySize: largeArray.length,
    memory_used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 High Load System API running at http://${HOST}:${PORT}`);
  console.log(`📊 Metrics: http://${HOST}:${PORT}/metrics`);
  console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
  console.log(`🐌 Slow endpoint: http://${HOST}:${PORT}/slow`);
  console.log(`⚡ Fast endpoint: http://${HOST}:${PORT}/fast`);
  console.log(`💥 Error simulation: http://${HOST}:${PORT}/error/500`);
  console.log('\n🔍 Available Prometheus Queries:');
  console.log('   Requests per second: rate(http_requests_total[5m])');
  console.log('   Average response time: rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])');
  console.log('   95th percentile latency: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))');
});

module.exports = app;