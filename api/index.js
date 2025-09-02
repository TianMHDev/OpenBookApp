// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import { pool, initializeDatabase } from '../backend/database/conexion_db.js';

// Import organized routes
import apiRoutes from '../backend/routes/index.js';

const app = express();

// Basic middleware
app.use(cors());
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

// Mount all API routes under /api
app.use('/api', apiRoutes);

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

    // Test database query
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM books");
    
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      data: {
        bookCount: rows[0].count,
        connectionStatus: 'active'
      },
      env: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        hasDbName: !!process.env.DB_NAME,
        hasDbPort: !!process.env.DB_PORT
      }
    });
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
        hasDbPort: !!process.env.DB_PORT
      }
    });
  }
});

// Environment info endpoint
app.get('/api/env-info', (req, res) => {
  res.json({
    success: true,
    data: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      port: process.env.PORT || 'unknown',
      timestamp: new Date().toISOString(),
      hasDbHost: !!process.env.DB_HOST,
      hasDbUser: !!process.env.DB_USER,
      hasDbPassword: !!process.env.DB_PASSWORD,
      hasDbName: !!process.env.DB_NAME,
      databaseInitialized: dbInitialized
    }
  });
});

// Database initialization endpoint
app.get('/api/init-db', async (req, res) => {
  try {
    await initializeApp();
    
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: 'Cannot initialize database without connection'
      });
    }

    // Read and execute the database setup script
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const setupScriptPath = path.join(__dirname, '..', 'database-setup.sql');
    
    const setupScript = await fs.readFile(setupScriptPath, 'utf8');
    
    // Split the script into individual statements
    const statements = setupScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    const results = [];
    
    for (const statement of statements) {
      try {
        if (statement.toLowerCase().includes('create table') || 
            statement.toLowerCase().includes('insert into')) {
          await pool.query(statement);
          results.push({ statement: statement.substring(0, 50) + '...', status: 'success' });
        }
      } catch (error) {
        results.push({ statement: statement.substring(0, 50) + '...', status: 'error', error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Database initialization completed',
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        totalStatements: statements.length,
        successful: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length
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
