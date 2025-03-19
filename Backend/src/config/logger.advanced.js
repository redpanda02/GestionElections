const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');

class AdvancedLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.metadata(),
        format.json()
      ),
      defaultMeta: {
        service: 'parrainage-api',
        environment: process.env.NODE_ENV
      },
      transports: this.setupTransports()
    });

    this.setupUnhandledRejections();
  }

  setupTransports() {
    const transports = [
      // Logs journaliers avec rotation
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      }),

      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      })
    ];

    // Elasticsearch en production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: process.env.ELASTICSEARCH_URL,
            auth: {
              username: process.env.ELASTICSEARCH_USER,
              password: process.env.ELASTICSEARCH_PASSWORD
            }
          },
          indexPrefix: 'parrainage-logs'
        })
      );
    }

    // Console en développement
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      );
    }

    return transports;
  }

  setupUnhandledRejections() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection', {
        reason,
        promise,
        stack: reason.stack
      });
    });

    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', {
        error,
        stack: error.stack
      });
      process.exit(1);
    });
  }

  // Méthodes de logging avec contexte
  info(message, meta = {}) {
    this.logger.info(message, this.addContext(meta));
  }

  error(message, meta = {}) {
    this.logger.error(message, this.addContext(meta));
  }

  warn(message, meta = {}) {
    this.logger.warn(message, this.addContext(meta));
  }

  debug(message, meta = {}) {
    this.logger.debug(message, this.addContext(meta));
  }

  // Ajoute le contexte de la requête si disponible
  addContext(meta) {
    const context = { ...meta };
    if (global.requestContext) {
      context.requestId = global.requestContext.requestId;
      context.userId = global.requestContext.userId;
      context.ip = global.requestContext.ip;
    }
    return context;
  }
}

module.exports = new AdvancedLogger(); 