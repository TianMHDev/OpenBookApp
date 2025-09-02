-- OpenBookApp Database Setup Script para Railway
-- Copia y pega este script en la consola SQL de Railway

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS openbook;
USE openbook;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de instituciones
CREATE TABLE IF NOT EXISTS institutions (
    institution_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
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
);

-- Tabla de libros
CREATE TABLE IF NOT EXISTS books (
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
);

-- Tabla de asignaciones de libros
CREATE TABLE IF NOT EXISTS book_assignments (
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
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    UNIQUE KEY unique_user_book (user_id, book_id)
);

-- Insertar roles por defecto
INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'maestro', 'Profesor que puede asignar libros y ver progreso de estudiantes'),
(2, 'estudiante', 'Estudiante que puede leer libros asignados y marcar favoritos');

-- Insertar instituciones por defecto
INSERT IGNORE INTO institutions (institution_id, institution_name) VALUES
(1, 'Colegio San José'),
(2, 'Colegio Marymount'),
(3, 'Colegio Alemán'),
(4, 'Colegio La Enseñanza'),
(5, 'Colegio Parrish'),
(6, 'Colegio Británico'),
(7, 'Colegio Lyndon B. Johnson'),
(8, 'Colegio Altamira'),
(9, 'Colegio Biffi'),
(10, 'Colegio IDPHUOS');

-- Insertar algunos libros de ejemplo
INSERT IGNORE INTO books (book_id, title, author, published_year, description, pages, genre) VALUES
(1, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 1605, 'Clásico de la literatura española', 863, 'Novela'),
(2, 'Cien años de soledad', 'Gabriel García Márquez', 1967, 'Obra maestra del realismo mágico', 417, 'Novela'),
(3, 'El Aleph', 'Jorge Luis Borges', 1949, 'Colección de cuentos fantásticos', 256, 'Cuento'),
(4, 'Pedro Páramo', 'Juan Rulfo', 1955, 'Novela fundamental de la literatura mexicana', 124, 'Novela'),
(5, 'Rayuela', 'Julio Cortázar', 1963, 'Novela experimental argentina', 628, 'Novela');

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_assignments_student ON book_assignments(student_id);
CREATE INDEX idx_assignments_book ON book_assignments(book_id);
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas:' as status;
SHOW TABLES;

SELECT 'Roles insertados:' as status;
SELECT * FROM roles;

SELECT 'Instituciones insertadas:' as status;
SELECT * FROM institutions;

SELECT 'Libros insertados:' as status;
SELECT * FROM books;
