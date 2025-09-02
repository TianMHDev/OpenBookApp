import express from "express";
import { pool } from "../database/conexion_db.js";
import { verificarToken, verificarRol } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all teacher routes
router.use(verificarToken);
// router.use(verificarRol(['maestro', 'teacher', 'admin']));

// ============================================================================
// TEACHER ROUTES
// =========================================================================

// GET /api/teacher/dashboard - Get teacher dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get teacher information with institution name
        const [teacherInfo] = await pool.query(
            `SELECT u.user_id, u.full_name, u.email, u.institution_id, u.created_at, i.institution_name 
             FROM users u 
             LEFT JOIN institutions i ON u.institution_id = i.institution_id 
             WHERE u.user_id = ?`,
            [userId]
        );
        
        if (teacherInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Maestro no encontrado"
            });
        }
        
        // Get student count
        const [studentCount] = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE role_id = 2 AND institution_id = (SELECT institution_id FROM users WHERE user_id = ?)",
            [userId]
        );
        
        // Get assignments count for students in the same institution
        const [assignmentsCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM book_assignments ba
             JOIN users u ON ba.student_id = u.user_id
             WHERE u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
             AND u.role_id = 2`,
            [userId]
        );
        
        // Get completed assignments count for students in the same institution
        const [completedCount] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM book_assignments ba
             JOIN users u ON ba.student_id = u.user_id
             WHERE u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
             AND u.role_id = 2
             AND ba.status = 'completed'`,
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                teacher: teacherInfo[0],
                stats: {
                    totalStudents: studentCount[0].count,
                    totalAssigned: assignmentsCount[0].count,
                    completedAssignments: completedCount[0].count
                }
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener dashboard del maestro:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/teacher/students - Get teacher's students
router.get('/students', async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log("🔍 Obteniendo estudiantes para el maestro:", userId);
        
        
        
        // Get students from the same institution (simplified query)
        const [students] = await pool.query(
            `SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.created_at,
                u.last_login
            FROM users u
            WHERE u.role_id = 2 
            AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
            ORDER BY u.full_name`,
            [userId]
        );
        
        console.log("✅ Estudiantes obtenidos:", students.length);
        
        res.json({
            success: true,
            data: students
        });
        
    } catch (error) {
        console.error("❌ Error al obtener estudiantes:", error);
        console.error("❌ Stack trace:", error.stack);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

// GET /api/teacher/catalog - Get books catalog for teachers
router.get('/catalog', async (req, res) => {
    try {
        const { page = 1, limit = 20, genre, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = "WHERE 1=1";
        let params = [];
        
        if (genre) {
            whereClause += " AND genre = ?";
            params.push(genre);
        }
        
        if (search) {
            whereClause += " AND (title LIKE ? OR author LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM books ${whereClause}`,
            params
        );
        
        // Get books with pagination
        const [books] = await pool.query(
            `SELECT 
                id, 
                title, 
                author, 
                genre, 
                cover_url, 
                description,
                created_at
            FROM books 
            ${whereClause}
            ORDER BY title 
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );
        
        // Get available genres for filtering
        const [genres] = await pool.query(
            "SELECT DISTINCT genre FROM books ORDER BY genre"
        );
        
        res.json({
            success: true,
            data: {
                books,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / limit)
                },
                filters: {
                    genres: genres.map(g => g.genre)
                }
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener catálogo:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/teacher/favorites - Get teacher's favorite books
router.get('/favorites', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [favorites] = await pool.query(
            `SELECT 
                b.id, 
                b.title, 
                b.author, 
                b.genre, 
                b.cover_url,
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

// POST /api/teacher/favorites - Add book to favorites
router.post('/favorites/:bookId', async (req, res) => {
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

// DELETE /api/teacher/favorites/:bookId - Remove book from favorites
router.delete('/favorites/:bookId', async (req, res) => {
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

// GET /api/teacher/students/search - Search students by email
router.get('/students/search', async (req, res) => {
    try {
        const { search, limit = 5 } = req.query;
        const userId = req.user.user_id;
        
        if (!search || search.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        // Search students in the same institution
        const [students] = await pool.query(
            `SELECT 
                u.user_id,
                u.full_name,
                u.email
            FROM users u
            WHERE u.role_id = 2 
            AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
            AND (u.email LIKE ? OR u.full_name LIKE ?)
            ORDER BY u.full_name
            LIMIT ?`,
            [userId, `%${search}%`, `%${search}%`, parseInt(limit)]
        );
        
        res.json({
            success: true,
            data: students
        });
        
    } catch (error) {
        console.error("❌ Error al buscar estudiantes:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/teacher/assignments - Get teacher's assignments
router.get('/assignments', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get assignments for students in the same institution
        const [assignments] = await pool.query(
            `SELECT 
                ba.assignment_id,
                ba.student_id,
                ba.book_id,
                ba.status,
                ba.progress,
                ba.assignment_date,
                ba.last_updated,
                u.full_name as studentName,
                u.email as studentEmail,
                b.title as bookTitle,
                b.author,
                b.cover_url
            FROM book_assignments ba
            JOIN users u ON ba.student_id = u.user_id
            JOIN books b ON ba.book_id = b.book_id
            WHERE u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
            AND u.role_id = 2
            ORDER BY ba.last_updated DESC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: assignments
        });
        
    } catch (error) {
        console.error("❌ Error al obtener asignaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// POST /api/teacher/assign - Assign book to student
router.post('/assign', async (req, res) => {
    try {
        const { studentEmail, bookId } = req.body;
        const teacherId = req.user.user_id;
        
        if (!studentEmail || !bookId) {
            return res.status(400).json({
                success: false,
                message: "Email del estudiante y ID del libro son requeridos"
            });
        }
        
        // Find student by email
        const [students] = await pool.query(
            `SELECT u.user_id, u.institution_id 
             FROM users u 
             WHERE u.email = ? AND u.role_id = 2 
             AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)`,
            [studentEmail, teacherId]
        );
        
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Estudiante no encontrado o no pertenece a tu institución"
            });
        }
        
        const studentId = students[0].user_id;
        
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
        
        // Check if assignment already exists
        const [existing] = await pool.query(
            "SELECT assignment_id FROM book_assignments WHERE student_id = ? AND book_id = ?",
            [studentId, bookId]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El libro ya está asignado a este estudiante"
            });
        }
        
        // Create assignment
        const [result] = await pool.query(
            "INSERT INTO book_assignments (student_id, book_id, status, progress) VALUES (?, ?, 'pending', 0)",
            [studentId, bookId]
        );
        
        res.status(201).json({
            success: true,
            message: "Libro asignado correctamente",
            assignmentId: result.insertId
        });
        
    } catch (error) {
        console.error("❌ Error al asignar libro:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// DELETE /api/teacher/assignments/:assignmentId - Remove book assignment
router.delete('/assignments/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const teacherId = req.user.user_id;
        
        // Verify the assignment belongs to a student in the same institution
        const [assignment] = await pool.query(
            `SELECT ba.assignment_id, ba.student_id, ba.book_id
             FROM book_assignments ba
             JOIN users u ON ba.student_id = u.user_id
             WHERE ba.assignment_id = ?
             AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
             AND u.role_id = 2`,
            [assignmentId, teacherId]
        );
        
        if (assignment.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asignación no encontrada o no tienes permisos para eliminarla"
            });
        }
        
        // Delete the assignment
        await pool.query(
            "DELETE FROM book_assignments WHERE assignment_id = ?",
            [assignmentId]
        );
        
        res.json({
            success: true,
            message: "Asignación eliminada correctamente"
        });
        
    } catch (error) {
        console.error("❌ Error al eliminar asignación:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/teacher/assignments/:assignmentId - Update book assignment
router.put('/assignments/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { status, progress } = req.body;
        const teacherId = req.user.user_id;
        
        // Validate input
        if (status && !['pending', 'in_progress', 'completed', 'overdue'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido. Debe ser: pending, in_progress, completed, o overdue"
            });
        }
        
        if (progress !== undefined && (progress < 0 || progress > 100)) {
            return res.status(400).json({
                success: false,
                message: "Progreso debe estar entre 0 y 100"
            });
        }
        
        // Verify the assignment belongs to a student in the same institution
        const [assignment] = await pool.query(
            `SELECT ba.assignment_id, ba.student_id, ba.book_id, ba.status, ba.progress
             FROM book_assignments ba
             JOIN users u ON ba.student_id = u.user_id
             WHERE ba.assignment_id = ?
             AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
             AND u.role_id = 2`,
            [assignmentId, teacherId]
        );
        
        if (assignment.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asignación no encontrada o no tienes permisos para editarla"
            });
        }
        
        // Build update query
        const updateFields = [];
        const updateValues = [];
        
        if (status !== undefined) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }
        
        if (progress !== undefined) {
            updateFields.push("progress = ?");
            updateValues.push(progress);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar al menos un campo para actualizar (status o progress)"
            });
        }
        
        updateFields.push("last_updated = NOW()");
        updateValues.push(assignmentId);
        
        // Update the assignment
        await pool.query(
            `UPDATE book_assignments SET ${updateFields.join(", ")} WHERE assignment_id = ?`,
            updateValues
        );
        
        res.json({
            success: true,
            message: "Asignación actualizada correctamente"
        });
        
    } catch (error) {
        console.error("❌ Error al actualizar asignación:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

export default router;
