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
        env: {
          hasDbHost: !!process.env.DB_HOST,
          hasDbUser: !!process.env.DB_USER,
          hasDbPassword: !!process.env.DB_PASSWORD,
          hasDbName: !!process.env.DB_NAME,
          hasDbPort: !!process.env.DB_PORT,
          dbHost: process.env.DB_HOST,
          dbPort: process.env.DB_PORT,
          dbName: process.env.DB_NAME,
          dbUser: process.env.DB_USER
        }
      });
    } catch (dbError) {
      res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: dbError.message,
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

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    await initializeApp();
    
    if (!dbInitialized) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: 'Cannot initialize database without connection'
      });
    }

    const results = [];
    
    // Create tables
    const createTables = [
      `CREATE TABLE IF NOT EXISTS roles (
        role_id INT PRIMARY KEY AUTO_INCREMENT,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS institutions (
        institution_id INT PRIMARY KEY AUTO_INCREMENT,
        institution_name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(100) NOT NULL,
        national_id VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        institution_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
        FOREIGN KEY (institution_id) REFERENCES institutions(institution_id)
      )`,
      `CREATE TABLE IF NOT EXISTS books (
        book_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        cover_url VARCHAR(500),
        published_year INT,
        description TEXT,
        pages INT,
        genre VARCHAR(100),
        isbn VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS book_assignments (
        assignment_id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        book_id INT NOT NULL,
        teacher_id INT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        progress INT DEFAULT 0,
        assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date DATE,
        completed_date TIMESTAMP NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(user_id),
        FOREIGN KEY (book_id) REFERENCES books(book_id),
        FOREIGN KEY (teacher_id) REFERENCES users(user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS user_favorites (
        favorite_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (book_id) REFERENCES books(book_id),
        UNIQUE KEY unique_user_book (user_id, book_id)
      )`
    ];

    // Execute create table statements
    for (const statement of createTables) {
      try {
        await pool.query(statement);
        results.push({ statement: 'CREATE TABLE...', status: 'success' });
      } catch (error) {
        results.push({ statement: 'CREATE TABLE...', status: 'error', error: error.message });
      }
    }

    // Insert initial data
    const insertData = [
      `INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
      (1, 'maestro', 'Profesor que puede asignar libros y ver progreso de estudiantes'),
      (2, 'estudiante', 'Estudiante que puede leer libros asignados y marcar favoritos')`,
      `INSERT IGNORE INTO institutions (institution_id, institution_name) VALUES
      (1, 'Colegio San José'),
      (2, 'Colegio Marymount'),
      (3, 'Colegio Alemán'),
      (4, 'Colegio La Enseñanza'),
      (5, 'Colegio Parrish'),
      (6, 'Colegio Británico'),
      (7, 'Colegio Lyndon B. Johnson'),
      (8, 'Colegio Altamira'),
      (9, 'Colegio Biffi'),
      (10, 'Colegio IDPHUOS')`,
      `INSERT IGNORE INTO books (book_id, title, author, published_year, description, pages, genre) VALUES
      (1, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 1605, 'Clásico de la literatura española', 863, 'Novela'),
      (2, 'Cien años de soledad', 'Gabriel García Márquez', 1967, 'Obra maestra del realismo mágico', 417, 'Novela'),
      (3, 'El Aleph', 'Jorge Luis Borges', 1949, 'Colección de cuentos fantásticos', 256, 'Cuento'),
      (4, 'Pedro Páramo', 'Juan Rulfo', 1955, 'Novela fundamental de la literatura mexicana', 124, 'Novela'),
      (5, 'Rayuela', 'Julio Cortázar', 1963, 'Novela experimental argentina', 628, 'Novela')`
    ];

    // Execute insert statements
    for (const statement of insertData) {
      try {
        await pool.query(statement);
        results.push({ statement: 'INSERT DATA...', status: 'success' });
      } catch (error) {
        results.push({ statement: 'INSERT DATA...', status: 'error', error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Database initialization completed',
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        totalStatements: createTables.length + insertData.length,
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

// Mount all API routes under /api
app.use('/api', apiRoutes);

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
        hasPassword: !!process.env.DB_PASSWORD
      },
      jwt: {
        hasSecret: !!process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
      },
      app: {
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV
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
