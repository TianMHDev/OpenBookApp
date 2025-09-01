// ============================================================================
// SYSTEM CONSTANTS AND CONFIGURATION
// ============================================================================

export const ROLES = {
    TEACHER: {
        id: 1,
        name: 'teacher',
        domain: 'maestro.edu.co',
        displayName: 'Maestro'
    },
    STUDENT: {
        id: 2, 
        name: 'student',
        domain: 'estudiante.edu.co',
        displayName: 'Estudiante'
    }
};

export const PASSWORD_CONFIG = {
    minLength: 8,
    saltRounds: 12,
    requireComplexity: true
};

export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || "tu_clave_secreta_aqui_cambiar_en_produccion",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h"
};

export const PAGINATION = {
    defaultLimit: 20,
    maxLimit: 100
};

export const BOOK_STATUS = {
    READING: 'reading',
    COMPLETED: 'completed',
    WANT_TO_READ: 'want_to_read',
    DNF: 'dnf' // Did Not Finish
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

export const API_MESSAGES = {
    SUCCESS: {
        USER_REGISTERED: "Usuario registrado exitosamente",
        USER_LOGGED_IN: "Inicio de sesión exitoso",
        PROFILE_UPDATED: "Perfil actualizado exitosamente",
        BOOK_ADDED_TO_FAVORITES: "Libro agregado a favoritos",
        BOOK_REMOVED_FROM_FAVORITES: "Libro removido de favoritos",
        BOOK_ADDED_TO_READING: "Libro agregado a tu lista de lectura",
        BOOK_STATUS_UPDATED: "Estado del libro actualizado"
    },
    ERROR: {
        TOKEN_REQUIRED: "Token requerido",
        TOKEN_EXPIRED: "Token expirado",
        TOKEN_INVALID: "Token inválido",
        INSUFFICIENT_PERMISSIONS: "No tienes permisos para acceder a este recurso",
        USER_NOT_FOUND: "Usuario no encontrado",
        BOOK_NOT_FOUND: "Libro no encontrado",
        FAVORITE_NOT_FOUND: "Favorito no encontrado",
        USER_ALREADY_EXISTS: "El usuario ya existe con ese email o documento de identidad",
        BOOK_ALREADY_IN_FAVORITES: "El libro ya está en tus favoritos",
        INVALID_CREDENTIALS: "Credenciales inválidas",
        VALIDATION_ERROR: "Error de validación",
        INTERNAL_SERVER_ERROR: "Error interno del servidor"
    }
};

export const VALIDATION_RULES = {
    EMAIL: {
        minLength: 5,
        maxLength: 254
    },
    PASSWORD: {
        minLength: 8,
        maxLength: 128
    },
    NAME: {
        minLength: 2,
        maxLength: 100
    },
    NATIONAL_ID: {
        minLength: 5,
        maxLength: 20
    }
};
