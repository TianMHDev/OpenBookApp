// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initializeDatabase } from '../backend/database/conexion_db.js';
import { sincronizarTodosLosGeneros } from '../backend/api/sync_openlibrary.js';
import { corsConfig, serverConfig, debugEnv } from '../backend/config/vercel.js';

// Import organized routes
import apiRoutes from '../backend/routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);

// Safe middleware setup
app.use(cors(corsConfig || {}));
app.use(express.json());

// Configure static files with error handling
try {
  app.use('/frontend', express.static('frontend'));
  app.use('/assets', express.static('frontend/assets'));
  app.use('/styles', express.static('frontend/styles'));
  app.use(express.static('frontend'));
} catch (error) {
  console.error('❌ Error setting up static files:', error.message);
}

// Mount all API routes under /api
try {
  app.use('/api', apiRoutes);
} catch (error) {
  console.error('❌ Error setting up API routes:', error.message);
}

// Frontend routes with error handling
app.get('/', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/index.html'));
    } catch (error) {
        console.error('❌ Error serving index:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/login', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/login.html'));
    } catch (error) {
        console.error('❌ Error serving login:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/register', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/register.html'));
    } catch (error) {
        console.error('❌ Error serving register:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

// Teacher routes
app.get('/teacher-dashboard', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/teacher-dashboard.html'));
    } catch (error) {
        console.error('❌ Error serving teacher dashboard:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/teacher-catalog', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/teacher-catalog.html'));
    } catch (error) {
        console.error('❌ Error serving teacher catalog:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/teacher-favs', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/teacher-favs.html'));
    } catch (error) {
        console.error('❌ Error serving teacher favs:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/teacher-mystudents', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/teacher-mystudents.html'));
    } catch (error) {
        console.error('❌ Error serving teacher mystudents:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

// Student routes
app.get('/student-dashboard', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/student-dashboard.html'));
    } catch (error) {
        console.error('❌ Error serving student dashboard:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/student-catalog', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/student-catalog.html'));
    } catch (error) {
        console.error('❌ Error serving student catalog:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/student-favs', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/student-favs.html'));
    } catch (error) {
        console.error('❌ Error serving student favs:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

app.get('/students-mybooks', (req, res) => {
    try {
        res.sendFile(path.resolve('frontend/views/students-mybooks.html'));
    } catch (error) {
        console.error('❌ Error serving students mybooks:', error.message);
        res.status(500).json({ success: false, message: 'Error serving page' });
    }
});

// Error handling
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Endpoint ${req.method} ${req.originalUrl} no encontrado`
    });
});

app.use('*', (req, res) => {
    if (req.path && req.path.includes('.')) {
        return res.status(404).json({
            success: false,
            message: `Archivo no encontrado: ${req.path}`
        });
    }
    try {
        res.sendFile(path.resolve('frontend/views/index.html'));
    } catch (error) {
        console.error('❌ Error serving catch-all route:', error.message);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.use((error, req, res, next) => {
    console.error("❌ Error no manejado:", error);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor"
    });
});

// Initialize database connection
let dbInitialized = false;

const initializeApp = async () => {
    if (!dbInitialized) {
        try {
            console.log("🚀 Starting OpenBook Backend...");
            console.log(`🌍 Environment: ${serverConfig?.nodeEnv || 'unknown'}`);
            
            // Debug environment variables
            debugEnv();
            
            console.log("🔄 Initializing database connection...");
            await initializeDatabase();
            dbInitialized = true;
            console.log("✅ Database initialized successfully");
            
            // Check if database is empty and sync if needed
            try {
                const [rows] = await pool.query("SELECT COUNT(*) as count FROM books");
                if (rows && rows[0] && rows[0].count === 0) {
                    console.log("📚 Database is empty. Starting synchronization...");
                    await sincronizarTodosLosGeneros();
                } else {
                    console.log("✅ Database already has books. No synchronization needed.");
                }
            } catch (error) {
                console.error("❌ Error checking database:", error.message);
            }
            
        } catch (error) {
            console.error("❌ Database initialization failed:", error.message);
            // Don't throw error, continue without database
        }
    }
};

// Export for Vercel serverless
export default async function handler(req, res) {
    try {
        console.log(`📥 Request: ${req.method} ${req.url}`);
        
        await initializeApp();
        
        // Handle the request with Express
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
    } catch (error) {
        console.error("❌ Handler error:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
}
