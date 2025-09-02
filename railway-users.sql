-- Script completo para Railway - Ejecutar en la consola SQL de Railway
-- Primero verificar que las tablas existen

-- Verificar roles
SELECT 'Verificando roles...' as status;
SELECT * FROM roles;

-- Verificar instituciones
SELECT 'Verificando instituciones...' as status;
SELECT * FROM institutions;

-- Verificar usuarios actuales
SELECT 'Usuarios actuales:' as status;
SELECT user_id, full_name, email, role_id FROM users;

-- Insertar usuarios de prueba (maestros)
INSERT INTO users (full_name, national_id, email, password, role_id, institution_id) VALUES
('Sebastian Marriaga', '123456789', 'sebastian@maestro.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 1, 1),
('Ana González', '987654321', 'ana@maestro.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 1, 2);

-- Insertar usuarios de prueba (estudiantes)
INSERT INTO users (full_name, national_id, email, password, role_id, institution_id) VALUES
('Juan Pérez', '111222333', 'juan.perez@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1),
('María López', '444555666', 'maria.lopez@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1),
('Carlos Ruiz', '777888999', 'carlos.ruiz@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1),
('Laura Torres', '123789456', 'laura.torres@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 2),
('Diego Morales', '456123789', 'diego.morales@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 2);

-- Verificar usuarios insertados
SELECT 'Usuarios después de la inserción:' as status;
SELECT user_id, full_name, email, role_id FROM users;

-- Verificar libros disponibles
SELECT 'Libros disponibles:' as status;
SELECT book_id, title, author FROM books LIMIT 5;


