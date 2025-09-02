import express from 'express';
import { pool } from '../database/conexion_db.js';
import { serverConfig } from '../config/vercel.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Check database connection
        const [rows] = await pool.query('SELECT 1 as status');
        
        res.json({
            success: true,
            message: 'OpenBook Backend is running',
            timestamp: new Date().toISOString(),
            environment: serverConfig.nodeEnv,
            database: {
                status: 'connected',
                test: rows[0].status === 1
            },
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            environment: serverConfig.nodeEnv
        });
    }
});

// Database test endpoint
router.get('/test-db', async (req, res) => {
    try {
        // Test database connection
        const connection = await pool.getConnection();
        
        // Test a simple query
        const [rows] = await connection.query('SELECT COUNT(*) as bookCount FROM books');
        
        connection.release();
        
        res.json({
            success: true,
            message: 'Database connection successful',
            data: {
                bookCount: rows[0].bookCount,
                connectionStatus: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Environment info endpoint (for debugging)
router.get('/env-info', (req, res) => {
    res.json({
        success: true,
        data: {
            nodeEnv: serverConfig.nodeEnv,
            port: serverConfig.port,
            timestamp: new Date().toISOString(),
            // Don't expose sensitive info like DB credentials
            hasDbHost: !!process.env.DB_HOST,
            hasDbUser: !!process.env.DB_USER,
            hasDbPassword: !!process.env.DB_PASSWORD,
            hasDbName: !!process.env.DB_NAME
        }
    });
});

export default router;
