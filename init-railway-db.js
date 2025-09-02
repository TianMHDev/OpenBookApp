/**
 * Railway Database Initialization Script
 * Creates all necessary tables for OpenBook application
 */

import mysql from 'mysql2/promise';

// Railway connection configuration
const dbConfig = {
  host: 'crossover.proxy.rlwy.net',
  port: 14400,
  user: 'raíz',
  password: 'LfoGYuVpGdzjmiyfIieZBDZJbbBPgWwf',
  database: 'ferrocarril',
  ssl: { rejectUnauthorized: false },
  acquireTimeout: 60000,
  timeout: 60000
};

// SQL statements to create tables
const createTables = [
  `CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS institutions (
    institution_id INT PRIMARY KEY AUTO_INCREMENT,
    institution_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS users (
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
  )`,
  
  `CREATE TABLE IF NOT EXISTS books (
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
  )`,
  
  `CREATE TABLE IF NOT EXISTS book_assignments (
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
  )`,
  
  `CREATE TABLE IF NOT EXISTS user_favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    UNIQUE KEY unique_user_book (user_id, book_id)
  )`
];

// Sample data to insert
const sampleData = [
  `INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
  (1, 'admin', 'Administrator with full access'),
  (2, 'teacher', 'Teacher with assignment and monitoring capabilities'),
  (3, 'student', 'Student with reading and progress tracking')`,
  
  `INSERT IGNORE INTO institutions (institution_id, institution_name, address, email) VALUES
  (1, 'OpenBook Academy', '123 Education St, Learning City', 'info@openbook.edu'),
  (2, 'Colegio San José', '456 Main St, City Center', 'info@san-jose.edu'),
  (3, 'Colegio Marymount', '789 Oak Ave, Downtown', 'info@marymount.edu')`,
  
  `INSERT IGNORE INTO books (book_id, title, author, published_year, description, pages, genre) VALUES
  (1, 'Don Quijote de la Mancha', 'Miguel de Cervantes', 1605, 'Clásico de la literatura española', 863, 'Novela'),
  (2, 'Cien años de soledad', 'Gabriel García Márquez', 1967, 'Obra maestra del realismo mágico', 417, 'Novela'),
  (3, 'El Aleph', 'Jorge Luis Borges', 1949, 'Colección de cuentos fantásticos', 256, 'Cuento'),
  (4, 'Pedro Páramo', 'Juan Rulfo', 1955, 'Novela fundamental de la literatura mexicana', 124, 'Novela'),
  (5, 'Rayuela', 'Julio Cortázar', 1963, 'Novela experimental argentina', 628, 'Novela'),
  (6, 'Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 1997, 'Primera novela de la serie de Harry Potter', 309, 'Fantasía'),
  (7, 'El Señor de los Anillos', 'J.R.R. Tolkien', 1954, 'Épica fantasía medieval', 1216, 'Fantasía'),
  (8, '1984', 'George Orwell', 1949, 'Distopía sobre vigilancia y control', 328, 'Ciencia Ficción')`
];

async function initializeDatabase() {
  console.log('🚀 ===== INICIALIZANDO BASE DE DATOS RAILWAY =====');
  console.log(`📍 Conectando a: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`📚 Base de datos: ${dbConfig.database}`);
  console.log('');
  
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida exitosamente');
    
    // Create tables
    console.log('\n📋 Creando tablas...');
    for (const statement of createTables) {
      try {
        await connection.execute(statement);
        const tableName = statement.split(' ')[5];
        console.log(`✅ Tabla creada: ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Tabla ya existe o error: ${error.message}`);
      }
    }
    
    // Insert sample data
    console.log('\n📚 Insertando datos de ejemplo...');
    for (const statement of sampleData) {
      try {
        await connection.execute(statement);
        console.log('✅ Datos insertados correctamente');
      } catch (error) {
        console.log(`⚠️  Datos ya existen o error: ${error.message}`);
      }
    }
    
    // Verify tables
    console.log('\n🔍 Verificando tablas creadas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas disponibles:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Count records
    console.log('\n📊 Contando registros...');
    const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles');
    
    console.log(`📚 Libros: ${books[0].count}`);
    console.log(`👤 Usuarios: ${users[0].count}`);
    console.log(`🎭 Roles: ${roles[0].count}`);
    
    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
  
  console.log('\n🎯 ===== FIN DE LA INICIALIZACIÓN =====');
}

// Run initialization
initializeDatabase().catch(console.error);
