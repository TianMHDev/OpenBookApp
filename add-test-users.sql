-- Script para agregar usuarios de prueba a OpenBook
-- Ejecuta este script en la consola SQL de Railway

-- Insertar usuarios de prueba
INSERT INTO users (full_name, national_id, email, password, role_id, institution_id) VALUES
('Sebastián Maestro', '123456789', 'sebastian@maestro.edu.co', 'password123', 1, 1),
('María Estudiante', '987654321', 'maria@estudiante.edu.co', 'password123', 2, 1),
('Carlos Profesor', '456789123', 'carlos@maestro.edu.co', 'password123', 1, 2),
('Ana Alumna', '789123456', 'ana@estudiante.edu.co', 'password123', 2, 2),
('Luis Docente', '321654987', 'luis@maestro.edu.co', 'password123', 1, 3),
('Sofia Estudiante', '654321987', 'sofia@estudiante.edu.co', 'password123', 2, 3);

-- Verificar que los usuarios se insertaron correctamente
SELECT 'Usuarios insertados:' as status;
SELECT user_id, full_name, email, role_id FROM users;


