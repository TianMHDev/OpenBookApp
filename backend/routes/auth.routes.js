/**
 * Authentication Routes
 * Handles user registration, login, and token verification
 * 
 * Endpoints:
 * - POST /register: Create new user account
 * - POST /login: Authenticate user and return JWT token
 * - GET /verify: Verify JWT token validity
 * 
 * @author OpenBook Development Team
 * @version 1.0.0
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database/conexion_db.js";

const router = express.Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email y contraseña son requeridos"
            });
        }

        // Find user by email
        const [users] = await pool.query(
            `SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.password, 
                u.role_id,
                r.role_name,
                i.institution_name,
                u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN institutions i ON u.institution_id = i.institution_id
            WHERE u.email = ?`,
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email, 
                role: user.role_name,
                role_id: user.role_id 
            },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: '24h' }
        );

        // Update last login
        await pool.query(
            "UPDATE users SET last_login = NOW() WHERE user_id = ?",
            [user.user_id]
        );

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            message: "Login exitoso",
            token,
            user
        });

    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
    try {
        const { 
            full_name, 
            national_id, 
            email, 
            password, 
            role_id, 
            institution_id, 
            institution_name 
        } = req.body;

        // Validate input
        if (!full_name || !national_id || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son requeridos"
            });
        }

        // Check if user already exists
        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE email = ? OR national_id = ?",
            [email.toLowerCase(), national_id]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Usuario ya existe con este email o número de identificación"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.query(
            `INSERT INTO users (
                full_name, 
                national_id, 
                email, 
                password, 
                role_id, 
                institution_id, 
                institution_name, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                full_name, 
                national_id, 
                email.toLowerCase(), 
                hashedPassword, 
                role_id, 
                institution_id || null, 
                institution_name || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token no proporcionado"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        
        const [users] = await pool.query(
            `SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.role_id,
                r.role_name,
                i.institution_name,
                u.created_at,
                u.last_login
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN institutions i ON u.institution_id = i.institution_id
            WHERE u.user_id = ?`,
            [decoded.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        res.status(401).json({
            success: false,
            message: "Token inválido"
        });
    }
});

export default router;