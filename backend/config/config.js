require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_dev',
    expiresIn: '1d'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },

  // Validation configuration
  validation: {
    password: {
      minLength: 6
    },
    cni: {
      // Add specific CNI validation rules if needed
      minLength: 13,
      maxLength: 13
    },
    nce: {
      // Add specific NCE validation rules if needed
      minLength: 8,
      maxLength: 8
    }
  },

  // Role configuration
  roles: {
    VOTER: 'voter',
    CANDIDATE: 'candidate'
  }
};

// Throw error if JWT_SECRET is not set in production
if (config.server.env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production environment');
}

module.exports = config;