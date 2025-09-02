import express from "express";
import { pool } from "../database/conexion_db.js";
import { verificarToken, verificarRol } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(verificarToken);

// ============================================================================
// USER ROUTES
// =========================================================================

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const [users] = await pool.query(
            `SELECT 
                user_id, 
                full_name, 
                email, 
                national_id,
                role_id,
                institution_id,
                institution_name,
                created_at,
                last_login
            FROM users 
            WHERE user_id = ?`,
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        const user = users[0];
        
        res.json({
            success: true,
            data: {
                ...user,
                role_name: user.role_id == 1 ? 'teacher' : 'student'
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// PUT /api/users/profile - Update current user profile
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { full_name, institution_name } = req.body;
        
        if (!full_name) {
            return res.status(400).json({
                success: false,
                message: "El nombre completo es obligatorio"
            });
        }
        
        const [result] = await pool.query(
            "UPDATE users SET full_name = ?, institution_name = ? WHERE user_id = ?",
            [full_name, institution_name, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        res.json({
            success: true,
            message: "Perfil actualizado exitosamente"
        });
        
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/users/students - Get all students (teachers only)
router.get('/students', verificarRol(['maestro', 'teacher', 'admin']), async (req, res) => {
    try {
        const teacherId = req.user.user_id;
        
        // Get students from the same institution
        const [students] = await pool.query(
            `SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.created_at,
                u.last_login,
                COUNT(DISTINCT ub.book_id) as books_read,
                COUNT(DISTINCT uf.book_id) as favorites_count
            FROM users u
            LEFT JOIN users_books ub ON u.user_id = ub.user_id
            LEFT JOIN user_favorites uf ON u.user_id = uf.user_id
            WHERE u.role_id = 2 
            AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)
            GROUP BY u.user_id
            ORDER BY u.full_name`,
            [teacherId]
        );
        
        res.json({
            success: true,
            data: students
        });
        
    } catch (error) {
        console.error("❌ Error al obtener estudiantes:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/users/students/:id - Get specific student details (teachers only)
router.get('/students/:id', verificarRol(['maestro', 'teacher', 'admin']), async (req, res) => {
    try {
        const teacherId = req.user.user_id;
        const studentId = req.params.id;
        
        // Verify student belongs to same institution
        const [students] = await pool.query(
            `SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.created_at,
                u.last_login,
                u.institution_name
            FROM users u
            WHERE u.user_id = ? 
            AND u.role_id = 2
            AND u.institution_id = (SELECT institution_id FROM users WHERE user_id = ?)`,
            [studentId, teacherId]
        );
        
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Estudiante no encontrado"
            });
        }
        
        // Get student's reading activity
        const [readingActivity] = await pool.query(
            `SELECT 
                b.book_id, 
                b.title, 
                b.author, 
                b.genre,
                ub.status,
                ub.registered_at as added_date
            FROM users_books ub
            JOIN books b ON ub.book_id = b.book_id
            WHERE ub.user_id = ?
            ORDER BY ub.registered_at DESC`,
            [studentId]
        );
        
        // Get student's favorites
        const [favorites] = await pool.query(
            `SELECT 
                b.book_id, 
                b.title, 
                b.author, 
                b.genre,
                uf.created_at as added_date
            FROM user_favorites uf
            JOIN books b ON uf.book_id = b.book_id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC`,
            [studentId]
        );
        
        res.json({
            success: true,
            data: {
                student: students[0],
                readingActivity: {
                    total: readingActivity.length,
                    books: readingActivity
                },
                favorites: {
                    total: favorites.length,
                    books: favorites
                }
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener estudiante:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

// GET /api/users/dashboard - Get user dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role_name;
        
        // Get user basic info
        const [userInfo] = await pool.query(
            "SELECT user_id, full_name, email, institution_id, created_at FROM users WHERE user_id = ?",
            [userId]
        );
        
        if (userInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        // Get user's reading stats
        const [readingStats] = await pool.query(
            `SELECT 
                COUNT(DISTINCT book_id) as total_books,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_books,
                COUNT(CASE WHEN status = 'reading' THEN 1 END) as currently_reading
            FROM users_books 
            WHERE user_id = ?`,
            [userId]
        );
        
        // Get user's favorites count
        const [favoritesCount] = await pool.query(
            "SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?",
            [userId]
        );
        
        // Get recent activity
        const [recentActivity] = await pool.query(
            `SELECT 
                'reading' as type,
                b.title,
                b.author,
                ub.status,
                ub.registered_at as date
            FROM users_books ub
            JOIN books b ON ub.book_id = b.book_id
            WHERE ub.user_id = ?
            UNION ALL
            SELECT 
                'favorite' as type,
                b.title,
                b.author,
                'added' as status,
                uf.created_at as date
            FROM user_favorites uf
            JOIN books b ON uf.book_id = b.book_id
            WHERE uf.user_id = ?
            ORDER BY date DESC
            LIMIT 10`,
            [userId, userId]
        );
        
        // Additional stats for teachers
        let additionalStats = {};
        if (userRole === 'teacher') {
            const [studentCount] = await pool.query(
                "SELECT COUNT(*) as count FROM users WHERE role_id = 2 AND institution_id = (SELECT institution_id FROM users WHERE user_id = ?)",
                [userId]
            );
            additionalStats.totalStudents = studentCount[0].count;
        }
        
        res.json({
            success: true,
            data: {
                user: userInfo[0],
                stats: {
                    totalBooks: readingStats[0].total_books || 0,
                    completedBooks: readingStats[0].completed_books || 0,
                    currentlyReading: readingStats[0].currently_reading || 0,
                    totalFavorites: favoritesCount[0].count || 0,
                    ...additionalStats
                },
                recentActivity: recentActivity
            }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener dashboard:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});



// GET /api/users/assignments - Get user's assignments
router.get('/assignments', async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get assignments for the current user
        const [assignments] = await pool.query(
            `SELECT 
                ba.assignment_id,
                ba.student_id,
                ba.book_id,
                ba.status,
                ba.progress,
                ba.assignment_date,
                ba.last_updated,
                'Profesor' as teacherName,
                b.title as bookTitle,
                b.author,
                b.cover_url,
                b.published_year
            FROM book_assignments ba
            JOIN books b ON ba.book_id = b.book_id
            WHERE ba.student_id = ?
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

// PUT /api/users/assignments/:assignmentId - Update assignment progress
router.put('/assignments/:assignmentId', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const assignmentId = req.params.assignmentId;
        const { progress } = req.body;
        
        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({
                success: false,
                message: "El progreso debe estar entre 0 y 100"
            });
        }
        
        // Verify assignment belongs to the user
        const [assignments] = await pool.query(
            "SELECT assignment_id FROM book_assignments WHERE assignment_id = ? AND student_id = ?",
            [assignmentId, userId]
        );
        
        if (assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Asignación no encontrada"
            });
        }
        
        // Update progress
        await pool.query(
            "UPDATE book_assignments SET progress = ?, last_updated = NOW() WHERE assignment_id = ?",
            [progress, assignmentId]
        );
        
        // Update status based on progress
        let status = 'pending';
        if (progress > 0 && progress < 100) {
            status = 'in_progress';
        } else if (progress >= 100) {
            status = 'completed';
        }
        
        await pool.query(
            "UPDATE book_assignments SET status = ? WHERE assignment_id = ?",
            [status, assignmentId]
        );
        
        res.json({
            success: true,
            message: "Progreso actualizado correctamente"
        });
        
    } catch (error) {
        console.error("❌ Error al actualizar progreso:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});

export default router;
