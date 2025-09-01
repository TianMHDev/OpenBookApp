/**
 * Book Management Routes
 * Handles book catalog, search, and content retrieval
 * 
 * Endpoints:
 * - GET /: Get all books with search and pagination
 * - GET /:id: Get specific book details
 * - GET /:id/content: Get book content for reading
 * - GET /genres: Get available book genres
 * 
 * @author OpenBook Development Team
 * @version 1.0.0
 */

import express from "express";
import { pool } from "../database/conexion_db.js";
import { verificarToken, verificarRol } from "../middleware/auth.middleware.js";

const router = express.Router();

// ============================================================================
// BOOK ROUTES
// =========================================================================

// GET /api/books - Get all books (public)
router.get('/', async (req, res) => {
    try {
        const { search, limit = 1000, offset = 0, sort = 'title-asc' } = req.query;
        
        console.log("🔍 Búsqueda solicitada:", { search, limit, offset, sort });
        
        // Construir la consulta SQL base
        let sql = `
            SELECT 
                book_id,
                title,
                author,
                cover_url,
                published_year as publication_year,
                description,
                created_at
            FROM books 
            WHERE 1=1
        `;
        
        const params = [];
        
        // Agregar filtro de búsqueda si se proporciona
        if (search) {
            sql += ` AND (
                LOWER(title) LIKE LOWER(?) OR 
                LOWER(author) LIKE LOWER(?)
            )`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }
        
        // Agregar ordenamiento
        const [sortField, sortOrder] = sort.split('-');
        const validSortFields = ['title', 'author', 'publication_year', 'created_at'];
        const validSortOrders = ['asc', 'desc'];
        
        const finalSortField = validSortFields.includes(sortField) ? sortField : 'title';
        const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'asc';
        
        sql += ` ORDER BY ${finalSortField} ${finalSortOrder.toUpperCase()}`;
        
        // Agregar límite y offset
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        console.log("📚 Ejecutando consulta SQL:", sql);
        console.log("📚 Parámetros:", params);
        
        const [books] = await pool.query(sql, params);
        
        console.log("📚 Libros encontrados:", books.length);
        
        res.json({
            success: true,
            data: {
                books: books
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener libros:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/books/genres - Get all available genres
router.get('/genres', async (req, res) => {
    try {
        const [genres] = await pool.query(
            "SELECT DISTINCT genre FROM books ORDER BY genre"
        );
        
        res.json({
            success: true,
            data: genres.map(g => g.genre)
        });
        
    } catch (error) {
        console.error("❌ Error al obtener géneros:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/books/:id - Get specific book details
router.get('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        
        const [books] = await pool.query(
            `SELECT 
                book_id, 
                title, 
                author, 
                genre, 
                cover_url, 
                description,
                published_year,
                created_at
            FROM books 
            WHERE book_id = ?`,
            [bookId]
        );
        
        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }
        
        res.json({
            success: true,
            data: books[0]
        });
        
    } catch (error) {
        console.error("❌ Error al obtener libro:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// Protected routes for authenticated users
router.use(verificarToken);

// GET /api/books/user/favorites - Get user's favorite books
router.get('/user/favorites', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get user's favorite books
        const [favorites] = await pool.query(
            `SELECT 
                b.book_id, 
                b.title, 
                b.author, 
                b.description, 
                b.cover_url,
                b.published_year,
                uf.created_at as added_date
            FROM user_favorites uf
            JOIN books b ON uf.book_id = b.book_id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: favorites
        });
        
    } catch (error) {
        console.error("❌ Error al obtener favoritos:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// POST /api/books/user/favorites/:bookId - Add book to user favorites
router.post('/user/favorites/:bookId', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const bookId = req.params.bookId;
        
        // Check if book exists
        const [books] = await pool.query(
            "SELECT book_id FROM books WHERE book_id = ?",
            [bookId]
        );
        
        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }
        
        // Check if already in favorites
        const [existing] = await pool.query(
            "SELECT id FROM user_favorites WHERE user_id = ? AND book_id = ?",
            [userId, bookId]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El libro ya está en tus favoritos"
            });
        }
        
        // Add to favorites
        await pool.query(
            "INSERT INTO user_favorites (user_id, book_id, created_at) VALUES (?, ?, NOW())",
            [userId, bookId]
        );
        
        res.status(201).json({
            success: true,
            message: "Libro agregado a favoritos"
        });
        
    } catch (error) {
        console.error("❌ Error al agregar a favoritos:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// DELETE /api/books/user/favorites/:bookId - Remove book from user favorites
router.delete('/user/favorites/:bookId', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const bookId = req.params.bookId;
        
        const [result] = await pool.query(
            "DELETE FROM user_favorites WHERE user_id = ? AND book_id = ?",
            [userId, bookId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Favorito no encontrado"
            });
        }
        
        res.json({
            success: true,
            message: "Libro removido de favoritos"
        });
        
    } catch (error) {
        console.error("❌ Error al remover de favoritos:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/books/user/reading - Get user's reading list
router.get('/user/reading', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [readingList] = await pool.query(
            `SELECT 
                b.book_id, 
                b.title, 
                b.author, 
                b.genre, 
                b.cover_url,
                ub.status,
                ub.registered_at as added_date
            FROM users_books ub
            JOIN books b ON ub.book_id = b.book_id
            WHERE ub.user_id = ?
            ORDER BY ub.registered_at DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: readingList
        });
        
    } catch (error) {
        console.error("❌ Error al obtener lista de lectura:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// POST /api/books/user/reading/:bookId - Add book to user's reading list
router.post('/user/reading/:bookId', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const bookId = req.params.bookId;
        const { status = 'reading' } = req.body;
        
        // Check if book exists
        const [books] = await pool.query(
            "SELECT book_id FROM books WHERE book_id = ?",
            [bookId]
        );
        
        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Libro no encontrado"
            });
        }
        
        // Check if already in reading list
        const [existing] = await pool.query(
            "SELECT user_id FROM users_books WHERE user_id = ? AND book_id = ?",
            [userId, bookId]
        );
        
        if (existing.length > 0) {
            // Update status if already exists
            await pool.query(
                "UPDATE users_books SET status = ? WHERE user_id = ? AND book_id = ?",
                [status, userId, bookId]
            );
            
            return res.json({
                success: true,
                message: "Estado del libro actualizado"
            });
        }
        
        // Add to reading list
        await pool.query(
            "INSERT INTO users_books (user_id, book_id, status, registered_at) VALUES (?, ?, ?, NOW())",
            [userId, bookId, status]
        );
        
        res.status(201).json({
            success: true,
            message: "Libro agregado a tu lista de lectura"
        });
        
    } catch (error) {
        console.error("❌ Error al agregar a lista de lectura:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

export default router;
