const promClient = require('prom-client');
const winston = require('winston');

// Création des métriques
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotalCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware de monitoring
const monitoringMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    // Enregistrement des métriques
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(durationInSeconds);

    httpRequestsTotalCounter
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();

    // Log structuré
    winston.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: durationInSeconds,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });

  next();
};

module.exports = monitoringMiddleware; 