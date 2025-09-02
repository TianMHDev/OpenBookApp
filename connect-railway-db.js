import mysql from 'mysql2/promise';

// Railway MySQL connection configuration
const dbConfig = {
  host: 'crossover.proxy.rlwy.net',
  port: 14400,
  user: 'root',
  password: '********', // You'll need to replace this with the actual password from Railway
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Test users data
const testUsers = [
  {
    full_name: 'Sebastian Marriaga',
    national_id: '123456789',
    email: 'sebastian@maestro.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi', // hashed password
    role_id: 1, // maestro
    institution_id: 1
  },
  {
    full_name: 'Ana González',
    national_id: '987654321',
    email: 'ana@maestro.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 1, // maestro
    institution_id: 2
  },
  {
    full_name: 'Juan Pérez',
    national_id: '111222333',
    email: 'juan.perez@estudiante.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 2, // estudiante
    institution_id: 1
  },
  {
    full_name: 'María López',
    national_id: '444555666',
    email: 'maria.lopez@estudiante.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 2, // estudiante
    institution_id: 1
  },
  {
    full_name: 'Carlos Ruiz',
    national_id: '777888999',
    email: 'carlos.ruiz@estudiante.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 2, // estudiante
    institution_id: 1
  },
  {
    full_name: 'Laura Torres',
    national_id: '123789456',
    email: 'laura.torres@estudiante.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 2, // estudiante
    institution_id: 2
  },
  {
    full_name: 'Diego Morales',
    national_id: '456123789',
    email: 'diego.morales@estudiante.edu.co',
    password: '$2b$12$edktJsuLuF.E/3IXy1uBde4nH8DTnJgPTNvE94apjCGV8A44VW3xi',
    role_id: 2, // estudiante
    institution_id: 2
  }
];

async function connectAndAddUsers() {
  let connection;
  
  try {
    console.log('🔌 Connecting to Railway MySQL database...');
    console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log(`🗄️ Database: ${dbConfig.database}`);
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to Railway MySQL database!');
    
    // Check existing tables
    console.log('\n📋 Checking database structure...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check existing users
    console.log('\n👥 Checking existing users...');
    const [existingUsers] = await connection.execute('SELECT user_id, full_name, email, role_id FROM users');
    console.log(`Found ${existingUsers.length} existing users:`);
    existingUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - Role ID: ${user.role_id}`);
    });
    
    // Check roles
    console.log('\n🎭 Checking roles...');
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.log('Available roles:', roles.map(r => ({ id: r.role_id, name: r.role_name })));
    
    // Check institutions
    console.log('\n🏫 Checking institutions...');
    const [institutions] = await connection.execute('SELECT * FROM institutions');
    console.log('Available institutions:', institutions.map(i => ({ id: i.institution_id, name: i.institution_name })));
    
    // Add test users
    console.log('\n➕ Adding test users...');
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const user of testUsers) {
      try {
        // Check if user already exists
        const [existing] = await connection.execute(
          'SELECT user_id FROM users WHERE email = ? OR national_id = ?',
          [user.email, user.national_id]
        );
        
        if (existing.length > 0) {
          console.log(`⏭️ Skipping ${user.full_name} - already exists`);
          skippedCount++;
          continue;
        }
        
        // Insert new user
        await connection.execute(
          'INSERT INTO users (full_name, national_id, email, password, role_id, institution_id) VALUES (?, ?, ?, ?, ?, ?)',
          [user.full_name, user.national_id, user.email, user.password, user.role_id, user.institution_id]
        );
        
        console.log(`✅ Added: ${user.full_name} (${user.email})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${user.full_name}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Added: ${addedCount} users`);
    console.log(`  - Skipped: ${skippedCount} users (already exist)`);
    
    // Show final user list
    console.log('\n👥 Final user list:');
    const [finalUsers] = await connection.execute('SELECT user_id, full_name, email, role_id FROM users ORDER BY user_id');
    finalUsers.forEach(user => {
      console.log(`  ${user.user_id}. ${user.full_name} (${user.email}) - Role ID: ${user.role_id}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure you have the correct password from Railway');
    console.log('2. Check if the Railway database is running');
    console.log('3. Verify the connection details in the Railway modal');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
console.log('🚀 Starting Railway database connection and user addition...\n');
connectAndAddUsers();


