/**
 * Test Clever Cloud Database Connection
 * This script tests the connection to Clever Cloud and shows database information
 */

import mysql from 'mysql2/promise';
import { dbConfig } from './backend/config/vercel.js';

async function testCleverCloudConnection() {
  console.log('🔍 Testing Clever Cloud Database Connection');
  console.log('==========================================\n');
  
  // Show configuration (without sensitive data)
  console.log('📋 Configuration:');
  console.log('Host:', dbConfig.host);
  console.log('Port:', dbConfig.port);
  console.log('Database:', dbConfig.database);
  console.log('User:', dbConfig.user);
  console.log('SSL:', dbConfig.ssl ? 'Enabled' : 'Disabled');
  console.log('');
  
  try {
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    
    // Test connection
    console.log('🔄 Testing connection...');
    const connection = await pool.getConnection();
    console.log('✅ Connection successful!');
    
    // Get database information
    console.log('\n📊 Database Information:');
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log('MySQL Version:', version[0].version);
    
    // Get table list
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Tables found: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('Table names:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
      
      // Show table details for first few tables
      console.log('\n📐 Table Details:');
      for (let i = 0; i < Math.min(3, tables.length); i++) {
        const tableName = Object.values(tables[i])[0];
        console.log(`\nTable: ${tableName}`);
        
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('Columns:');
        columns.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Get row count
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`Rows: ${count[0].count}`);
      }
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test SELECT
    if (tables.length > 0) {
      const firstTable = Object.values(tables[0])[0];
      const [sampleData] = await connection.execute(`SELECT * FROM ${firstTable} LIMIT 1`);
      console.log(`✅ SELECT test passed (${sampleData.length} rows returned)`);
    }
    
    // Test INSERT (if users table exists)
    const usersTable = tables.find(table => Object.values(table)[0] === 'users');
    if (usersTable) {
      console.log('\n📝 Testing INSERT operation...');
      const testUser = {
        username: 'test_user_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password_hash: 'test_hash',
        created_at: new Date()
      };
      
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        [testUser.username, testUser.email, testUser.password_hash, testUser.created_at]
      );
      console.log(`✅ INSERT test passed (ID: ${result.insertId})`);
      
      // Clean up test data
      await connection.execute('DELETE FROM users WHERE username = ?', [testUser.username]);
      console.log('🧹 Test data cleaned up');
    }
    
    connection.release();
    pool.end();
    
    console.log('\n🎉 All tests passed! Clever Cloud is ready to use.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your Clever Cloud credentials');
    console.error('2. Verify the database exists');
    console.error('3. Check if your IP is whitelisted');
    console.error('4. Verify SSL configuration');
    
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCleverCloudConnection();
}

export { testCleverCloudConnection };
