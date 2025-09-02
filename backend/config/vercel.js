/**
 * Vercel Configuration
 * Handles environment variables and configuration for Vercel deployment
 */

// Database configuration for Vercel
export const dbConfig = {
  // Support both Railway and custom variable names
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'openbook',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add SSL configuration for production databases
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  // Add connection timeout and retry settings
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
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
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// External API configuration
export const apiConfig = {
  openLibraryUrl: process.env.OPENLIBRARY_API_URL || 'https://openlibrary.org/api'
};

// Debug function to log environment variables (without sensitive data)
export const debugEnv = () => {
  console.log('🔧 Environment Configuration:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('DB_HOST:', process.env.DB_HOST ? '✅ set' : '❌ not set');
  console.log('DB_USER:', process.env.DB_USER ? '✅ set' : '❌ not set');
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ set' : '❌ not set');
  console.log('DB_NAME:', process.env.DB_NAME ? '✅ set' : '❌ not set');
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ set' : '❌ not set');
};
