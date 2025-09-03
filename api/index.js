// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import { pool, initializeDatabase } from '../backend/database/conexion_db.js';

// Import organized routes
import apiRoutes from '../backend/routes/index.js';

const app = express();

// CORS configuration for Vercel serverless
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel frontend domains and local development
    const allowedOrigins = [
      'https://frontend-5qdr0np9b-jadensmithahr-8971s-projects.vercel.app',
      'https://frontend-eq79nhikj-jadensmithahr-8971s-projects.vercel.app',
      'https://openbook-frontend.vercel.app',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    
    // Check if origin is in allowed list or contains vercel.app
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});
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
      },
      cors: {
        origin: req.headers.origin,
        method: req.method,
        headers: req.headers
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

// CORS test endpoint
app.options('/api/cors-test', (req, res) => {
  res.status(204).end();
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    request: {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers
    }
  });
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
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Clever Cloud specific test endpoint
app.get('/api/test-clever-cloud', async (req, res) => {
  try {
    console.log('🔍 Testing Clever Cloud connection...');
    
    // Import mysql2 for direct connection
    const mysql = await import('mysql2/promise');
    
    // Clever Cloud configuration
    const cleverCloudConfig = {
      host: process.env.CLEVER_CLOUD_HOST || 'b6snjvcp4mfobhjuwuxk-mysql.services.clever-cloud.com',
      port: parseInt(process.env.CLEVER_CLOUD_PORT) || 3306,
      user: process.env.CLEVER_CLOUD_USER || 'uv331tr9mhvctrgf',
      password: process.env.CLEVER_CLOUD_PASSWORD || 'vaZUTPVIjY0xv9Jjqqg3',
      database: process.env.CLEVER_CLOUD_DATABASE || 'b6snjvcp4mfobhjuwuxk',
      ssl: { rejectUnauthorized: false }
    };
    
    console.log('📋 Configuration:', {
      host: cleverCloudConfig.host,
      port: cleverCloudConfig.port,
      database: cleverCloudConfig.database,
      user: cleverCloudConfig.user,
      ssl: !!cleverCloudConfig.ssl
    });
    
    // Create connection
    const connection = await mysql.default.createConnection(cleverCloudConfig);
    console.log('✅ Connection successful!');
    
    // Test basic query
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables`);
    
    // Test data in key tables
    const keyTables = ['roles', 'institutions', 'users', 'books', 'genres'];
    const tableData = {};
    
    for (const tableName of keyTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        tableData[tableName] = count[0].count;
      } catch (error) {
        tableData[tableName] = 'Error: ' + error.message;
      }
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Clever Cloud connection successful!',
      timestamp: new Date().toISOString(),
      data: {
        tablesFound: tables.length,
        tableNames: tables.map(t => Object.values(t)[0]),
        tableData: tableData
      },
      config: {
        host: cleverCloudConfig.host,
        port: cleverCloudConfig.port,
        database: cleverCloudConfig.database,
        user: cleverCloudConfig.user,
        ssl: !!cleverCloudConfig.ssl
      },
      env: {
        hasCleverHost: !!process.env.CLEVER_CLOUD_HOST,
        hasCleverUser: !!process.env.CLEVER_CLOUD_USER,
        hasCleverPassword: !!process.env.CLEVER_CLOUD_PASSWORD,
        hasCleverDatabase: !!process.env.CLEVER_CLOUD_DATABASE,
        hasCleverPort: !!process.env.CLEVER_CLOUD_PORT,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('❌ Clever Cloud test failed:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Clever Cloud connection failed',
      error: error.message,
      config: {
        host: process.env.CLEVER_CLOUD_HOST || 'not set',
        port: process.env.CLEVER_CLOUD_PORT || 'not set',
        database: process.env.CLEVER_CLOUD_DATABASE || 'not set',
        user: process.env.CLEVER_CLOUD_USER || 'not set',
        password: process.env.CLEVER_CLOUD_PASSWORD ? 'set' : 'not set'
      },
      env: {
        hasCleverHost: !!process.env.CLEVER_CLOUD_HOST,
        hasCleverUser: !!process.env.CLEVER_CLOUD_USER,
        hasCleverPassword: !!process.env.CLEVER_CLOUD_PASSWORD,
        hasCleverDatabase: !!process.env.CLEVER_CLOUD_DATABASE,
        hasCleverPort: !!process.env.CLEVER_CLOUD_PORT,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
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
