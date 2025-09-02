import mysql from 'mysql2/promise';

// Railway database configuration using public URL
const dbConfig = {
  host: 'turntable.proxy.rlwy.net',
  user: 'root',
  password: 'AngjVVYfKiHSzhIXLdbwyimDbTtypQEn',
  database: 'railway',
  port: 13786
};

console.log('🔗 Conectando a Railway MySQL...');
console.log('📍 Host:', dbConfig.host);
console.log('👤 User:', dbConfig.user);
console.log('📚 Database:', dbConfig.database);

async function addUsers() {
  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a Railway MySQL');

    // Check current users
    const [currentUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('👥 Usuarios actuales:', currentUsers[0].count);

    // Add test users
    const insertQuery = `
      INSERT INTO users (full_name, national_id, email, password, role_id, institution_id) VALUES
      ('Sebastian Marriaga', '123456789', 'sebastian@maestro.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 1, 1),
      ('Ana González', '987654321', 'ana@maestro.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 1, 2),
      ('Juan Pérez', '111222333', 'juan.perez@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1),
      ('María López', '444555666', 'maria.lopez@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1),
      ('Carlos Ruiz', '777888999', 'carlos.ruiz@estudiante.edu.co', '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', 2, 1)
    `;

    await connection.execute(insertQuery);
    console.log('✅ Usuarios agregados exitosamente');

    // Verify users were added
    const [newUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('👥 Total de usuarios después:', newUsers[0].count);

    // Show user details
    const [userDetails] = await connection.execute('SELECT user_id, full_name, email, role_id FROM users');
    console.log('📋 Detalles de usuarios:');
    userDetails.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - Rol: ${user.role_id}`);
    });

    await connection.end();
    console.log('🎉 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUsers();
