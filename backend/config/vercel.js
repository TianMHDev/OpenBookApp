/**
 * Vercel Configuration
 * Handles environment variables and configuration for Vercel deployment
 */

// Database configuration for Vercel
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'openbook',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add SSL configuration for production databases
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

// CORS configuration for Vercel
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Server configuration
export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// External API configuration
export const apiConfig = {
  openLibraryUrl: process.env.OPENLIBRARY_API_URL || 'https://openlibrary.org/api'
};
