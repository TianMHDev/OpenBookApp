import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// =========================================================================

/**
 * Verify JWT token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function verificarToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token requerido"
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expirado"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token inválido"
            });
        }
        
        res.status(401).json({
            success: false,
            message: "Token inválido"
        });
    }
}

/**
 * Verify user role middleware
 * @param {Array} rolesPermitidos - Array of allowed roles
 * @returns {Function} Middleware function
 */
export function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        const userRole = req.user?.role_name || req.user?.role;
        
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: "Rol de usuario no definido"
            });
        }
        
        // Convert role_id to role name if needed
        let roleName = userRole;
        if (typeof userRole === 'number') {
            roleName = userRole === 1 ? 'teacher' : userRole === 2 ? 'student' : 'unknown';
        }
        
        if (!rolesPermitidos.includes(roleName.toLowerCase())) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder a este recurso"
            });
        }
        
        next();
    };
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function verificarTokenOpcional(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Silently ignore invalid tokens for optional auth
            console.log("Token opcional inválido:", error.message);
        }
    }
    
    next();
}

/**
 * Check if user is authenticated (helper function)
 * @param {Object} req - Express request object
 * @returns {Boolean} True if user is authenticated
 */
export function isAuthenticated(req) {
    return !!req.user;
}

/**
 * Check if user has specific role (helper function)
 * @param {Object} req - Express request object
 * @param {String} role - Role to check
 * @returns {Boolean} True if user has the role
 */
export function hasRole(req, role) {
    if (!req.user) return false;
    
    const userRole = req.user.role_name || req.user.role;
    if (typeof userRole === 'number') {
        return (userRole === 1 && role === 'teacher') || (userRole === 2 && role === 'student');
    }
    
    return userRole === role;
}
