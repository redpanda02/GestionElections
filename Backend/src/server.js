require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const logger = require('./config/logger');
const { handleError, ErrorHandler } = require('./middlewares/error.middleware'); // Updated this line
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const i18next = require('./config/i18n');
const middleware = require('i18next-http-middleware');

// Remove this line as we're using destructured import above
// const ErrorHandler = require('./middlewares/error.middleware');

// Import des routes
const routes = require('./routes');

const app = express();

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    status: 'error',
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

// Middlewares de sécurité et configuration
app.use(helmet()); // Sécurité des headers HTTP
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de parsing
app.use(express.json({ limit: '10kb' })); // Limite la taille du body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Rate limiting
app.use('/api', limiter);

// Configuration i18n
app.use(middleware.handle(i18next));

// Préfixe API
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Routes
app.use(API_PREFIX, routes);

// Documentation API
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Parrainage Electoral - Documentation"
  }));
}

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware pour les routes non trouvées
app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} non trouvée`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use(handleError);

// Remove these lines as they don't exist
// app.use(ErrorHandler.handleNotFound);
// process.on('uncaughtException', ErrorHandler.handleUncaughtException);
// process.on('unhandledRejection', ErrorHandler.handleUnhandledRejection);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test de la connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');

    // Démarrage du serveur
    if (require.main === module) {
      app.listen(PORT, () => {
        logger.info(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
        logger.info(`API accessible sur http://localhost:${PORT}${API_PREFIX}`);
      });
    }
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Update these handlers to use the logger directly since we removed those methods
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();

module.exports = app;