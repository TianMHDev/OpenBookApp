// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initializeDatabase } from '../backend/database/conexion_db.js';
import { sincronizarTodosLosGeneros } from '../backend/api/sync_openlibrary.js';
import { corsConfig, serverConfig } from '../backend/config/vercel.js';

// Import organized routes
import apiRoutes from '../backend/routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);

app.use(cors(corsConfig));
app.use(express.json());

// Configure static files
app.use('/frontend', express.static('frontend'));
app.use('/assets', express.static('frontend/assets'));
app.use('/styles', express.static('frontend/styles'));
app.use(express.static('frontend'));

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.resolve('frontend/views/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.resolve('frontend/views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.resolve('frontend/views/register.html'));
});

// Teacher routes
app.get('/teacher-dashboard', (req, res) => {
    res.sendFile(path.resolve('frontend/views/teacher-dashboard.html'));
});

app.get('/teacher-catalog', (req, res) => {
    res.sendFile(path.resolve('frontend/views/teacher-catalog.html'));
});

app.get('/teacher-favs', (req, res) => {
    res.sendFile(path.resolve('frontend/views/teacher-favs.html'));
});

app.get('/teacher-mystudents', (req, res) => {
    res.sendFile(path.resolve('frontend/views/teacher-mystudents.html'));
});

// Student routes
app.get('/student-dashboard', (req, res) => {
    res.sendFile(path.resolve('frontend/views/student-dashboard.html'));
});

app.get('/student-catalog', (req, res) => {
    res.sendFile(path.resolve('frontend/views/student-catalog.html'));
});

app.get('/student-favs', (req, res) => {
    res.sendFile(path.resolve('frontend/views/student-favs.html'));
});

app.get('/students-mybooks', (req, res) => {
    res.sendFile(path.resolve('frontend/views/students-mybooks.html'));
});

// Error handling
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Endpoint ${req.method} ${req.originalUrl} no encontrado`
    });
});

app.use('*', (req, res) => {
    if (req.path.includes('.')) {
        return res.status(404).json({
            success: false,
            message: `Archivo no encontrado: ${req.path}`
        });
    }
    res.sendFile(path.resolve('frontend/views/index.html'));
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
            console.log("🔄 Initializing database connection...");
            await initializeDatabase();
            dbInitialized = true;
            console.log("✅ Database initialized successfully");
        } catch (error) {
            console.error("❌ Database initialization failed:", error.message);
        }
    }
};

// Export for Vercel serverless
export default async function handler(req, res) {
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
                resolve();
            }
        });
    });
}
