const crypto = require('crypto');

module.exports = {
  // Configuration des politiques de mot de passe
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 jours
  },

  // Configuration des sessions
  sessionConfig: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'sessionId',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      sameSite: 'strict'
    },
    resave: false,
    saveUninitialized: false
  },

  // Configuration JWT
  jwtConfig: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
    algorithm: 'HS256',
    issuer: 'parrainage-api'
  },

  // Fonction de validation de mot de passe
  validatePassword: (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    );
  },

  // Fonction de génération de token sécurisé
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  }
}; 