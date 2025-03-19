const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const logger = require('./logger.advanced');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 1, // Base de données différente pour les sessions
});

const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: 'strict'
  }
};

// Nettoyage périodique des sessions expirées
setInterval(() => {
  redisClient.keys('sess:*').then(keys => {
    keys.forEach(key => {
      redisClient.get(key).then(session => {
        if (session) {
          const sessionData = JSON.parse(session);
          if (new Date(sessionData.cookie.expires) < new Date()) {
            redisClient.del(key);
          }
        }
      });
    });
  });
}, 60 * 60 * 1000); // Toutes les heures

module.exports = session(sessionConfig); 