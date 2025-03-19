const promClient = require('prom-client');
const logger = require('../config/logger.advanced');

class PerformanceMonitoring {
  constructor() {
    this.metrics = {};
    this.setupMetrics();
  }

  setupMetrics() {
    // Métriques HTTP
    this.metrics.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    // Métriques de la base de données
    this.metrics.dbQueryDuration = new promClient.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5]
    });

    // Métriques de cache
    this.metrics.cacheHits = new promClient.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits'
    });

    this.metrics.cacheMisses = new promClient.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses'
    });

    // Métriques des erreurs
    this.metrics.errors = new promClient.Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type']
    });

    // Métriques de mémoire
    this.metrics.memoryUsage = new promClient.Gauge({
      name: 'node_memory_usage_bytes',
      help: 'Node.js memory usage in bytes',
      labelNames: ['type']
    });

    // Métriques des parrainages
    this.metrics.parrainagesTotal = new promClient.Counter({
      name: 'parrainages_total',
      help: 'Total number of parrainages',
      labelNames: ['status']
    });
  }

  // Middleware pour mesurer la durée des requêtes
  measureRequestDuration() {
    return (req, res, next) => {
      const start = process.hrtime();

      res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;

        this.metrics.httpRequestDuration
          .labels(req.method, req.route?.path || req.path, res.statusCode)
          .observe(durationInSeconds);
      });

      next();
    };
  }

  // Mesure de la durée des requêtes DB
  async measureDbQuery(operation, table, queryPromise) {
    const start = process.hrtime();
    try {
      const result = await queryPromise;
      const duration = process.hrtime(start);
      this.metrics.dbQueryDuration
        .labels(operation, table)
        .observe(duration[0] + duration[1] / 1e9);
      return result;
    } catch (error) {
      this.metrics.errors.labels('database').inc();
      throw error;
    }
  }

  // Collecte périodique des métriques de mémoire
  startMemoryMonitoring(interval = 60000) {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      Object.entries(memoryUsage).forEach(([type, value]) => {
        this.metrics.memoryUsage.labels(type).set(value);
      });
    }, interval);
  }

  // Endpoint pour exposer les métriques
  metricsEndpoint() {
    return async (req, res) => {
      try {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
      } catch (error) {
        logger.error('Error generating metrics', { error });
        res.status(500).end();
      }
    };
  }

  // Surveillance des performances du cache
  trackCacheOperation(hit) {
    if (hit) {
      this.metrics.cacheHits.inc();
    } else {
      this.metrics.cacheMisses.inc();
    }
  }

  // Surveillance des parrainages
  trackParrainage(status) {
    this.metrics.parrainagesTotal.labels(status).inc();
  }

  // Génération de rapports de performance
  async generatePerformanceReport() {
    try {
      const metrics = await promClient.register.getMetricsAsJSON();
      const report = {
        timestamp: new Date(),
        metrics: metrics,
        summary: {
          totalRequests: await this.calculateTotalRequests(),
          averageResponseTime: await this.calculateAverageResponseTime(),
          errorRate: await this.calculateErrorRate(),
          cacheHitRate: await this.calculateCacheHitRate()
        }
      };

      logger.info('Performance report generated', { report });
      return report;
    } catch (error) {
      logger.error('Error generating performance report', { error });
      throw error;
    }
  }

  async calculateTotalRequests() {
    const data = await this.metrics.httpRequestDuration.get();
    return data.values.reduce((acc, curr) => acc + curr.value, 0);
  }

  async calculateAverageResponseTime() {
    const data = await this.metrics.httpRequestDuration.get();
    const sum = data.values.reduce((acc, curr) => acc + (curr.value * curr.exemplar), 0);
    const count = data.values.reduce((acc, curr) => acc + curr.exemplar, 0);
    return count > 0 ? sum / count : 0;
  }

  async calculateErrorRate() {
    const errors = await this.metrics.errors.get();
    const requests = await this.calculateTotalRequests();
    return requests > 0 ? (errors.value / requests) * 100 : 0;
  }

  async calculateCacheHitRate() {
    const hits = await this.metrics.cacheHits.get();
    const misses = await this.metrics.cacheMisses.get();
    const total = hits.value + misses.value;
    return total > 0 ? (hits.value / total) * 100 : 0;
  }
}

module.exports = new PerformanceMonitoring(); 