// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import { pool, initializeDatabase } from '../backend/database/conexion_db.js';

// Import organized routes
import apiRoutes from '../backend/routes/index.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:5173',
    'https://open-book-app-web.vercel.app',
    'https://open-book-app.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize database connection
let dbInitialized = false;

const initializeApp = async () => {
  if (!dbInitialized) {
    try {
      console.log("🔄 Initializing database connection...");
      await initializeDatabase();
      dbInitialized = true;
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization failed:", error.message);
      // Continue without database
    }
  }
};

// Simple health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await initializeApp();
    
    res.json({
      success: true,
      message: 'OpenBook Backend is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        initialized: dbInitialized,
        status: dbInitialized ? 'connected' : 'failed'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    await initializeApp();
    
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database not initialized',
        env: {
          hasDbHost: !!process.env.DB_HOST,
          hasDbUser: !!process.env.DB_USER,
          hasDbPassword: !!process.env.DB_PASSWORD,
          hasDbName: !!process.env.DB_NAME,
          hasDbPort: !!process.env.DB_PORT
        }
      });
    }

    // Import dbConfig to show actual configuration
    const { dbConfig } = await import('../backend/config/vercel.js').catch(() => ({ dbConfig: { host: 'error', port: 'error', database: 'error', user: 'error' } }));
    
    // Test database query with better error handling
    try {
      const [rows] = await pool.query("SELECT COUNT(*) as count FROM books");
      
      res.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
        data: {
          bookCount: rows[0].count,
          connectionStatus: 'active'
        },
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          ssl: !!dbConfig.ssl
        },
        env: {
          hasDbHost: !!process.env.DB_HOST,
          hasDbUser: !!process.env.DB_USER,
          hasDbPassword: !!process.env.DB_PASSWORD,
          hasDbName: !!process.env.DB_NAME,
          hasDbPort: !!process.env.DB_PORT,
          dbHost: process.env.DB_HOST,
          dbPort: process.env.DB_PORT,
          dbName: process.env.DB_NAME,
          dbUser: process.env.DB_USER,
          nodeEnv: process.env.NODE_ENV
        }
      });
    } catch (dbError) {
      res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: dbError.message,
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
          ssl: !!dbConfig.ssl
        },
        env: {
          hasDbHost: !!process.env.DB_HOST,
          hasDbUser: !!process.env.DB_USER,
          hasDbPassword: !!process.env.DB_PASSWORD,
          hasDbName: !!process.env.DB_NAME,
          hasDbPort: !!process.env.DB_PORT,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      env: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        hasDbName: !!process.env.DB_NAME,
        hasDbPort: !!process.env.DB_PORT,
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
});

// Initialize database endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    console.log("🔄 Manually initializing database...");
    await initializeDatabase();
    dbInitialized = true;
    
    res.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
      database: {
        initialized: true,
        status: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

// Environment info endpoint
app.get('/api/env-info', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Environment information',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD,
        fullHost: process.env.DB_HOST,
        fullPort: process.env.DB_PORT
      },
      jwt: {
        hasSecret: !!process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
      },
      app: {
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV
      },
      raw: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting environment info',
      error: error.message
    });
  }
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Catch-all for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint ${req.method} ${req.originalUrl} no encontrado`
  });
});

// Default route
app.get('*', (req, res) => {
  res.json({
    success: true,
    message: 'OpenBook Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    request: {
      method: req.method,
      url: req.url,
      path: req.path || 'unknown'
    },
    env: {
      hasDbHost: !!process.env.DB_HOST,
      hasDbUser: !!process.env.DB_USER,
      hasDbPassword: !!process.env.DB_PASSWORD,
      hasDbName: !!process.env.DB_NAME,
      hasDbPort: !!process.env.DB_PORT,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      databaseInitialized: dbInitialized
    }
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error("❌ Error no manejado:", error);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor"
  });
});

// Export for Vercel serverless
export default function handler(req, res) {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        console.error("❌ Express error:", err);
        res.status(500).json({
          success: false,
          message: "Error interno del servidor"
        });
        resolve();
      } else {
        console.log(`✅ Request completed: ${req.method} ${req.url}`);
        resolve();
      }
    });
  });
}
