/**
 * Database Connection Debug Script
 * Tests different database configurations to identify the issue
 */

import mysql from 'mysql2/promise';

// Test configurations
const testConfigs = [
  {
    name: 'Railway External (crossover.proxy.rlwy.net)',
    config: {
      host: 'crossover.proxy.rlwy.net',
      port: 14400,
      user: 'root',
      password: 'LfoGYuVpGdzjmiyfIieZBDZJbbBPgWwf',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
      acquireTimeout: 60000,
      timeout: 60000
    }
  },
  {
    name: 'Railway Internal (mysql.railway.internal)',
    config: {
      host: 'mysql.railway.internal',
      port: 3306,
      user: 'root',
      password: 'LfoGYuVpGdzjmiyfIieZBDZJbbBPgWwf',
      database: 'railway',
      acquireTimeout: 60000,
      timeout: 60000
    }
  }
];

async function testConnection(config, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`📍 Host: ${config.host}:${config.port}`);
  
  try {
    const pool = mysql.createPool(config);
    const connection = await pool.getConnection();
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM books');
    console.log(`📚 Books in database: ${rows[0].count}`);
    
    connection.release();
    await pool.end();
    
    return { success: true, count: rows[0].count };
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 ===== DATABASE CONNECTION DEBUG =====');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  for (const testConfig of testConfigs) {
    await testConnection(testConfig.config, testConfig.name);
  }
  
  console.log('\n🎯 ===== RECOMMENDATIONS =====');
  console.log('1. Check Railway dashboard for correct connection details');
  console.log('2. Verify environment variables in Vercel');
  console.log('3. Ensure SSL is properly configured for external connections');
  console.log('4. Check if Railway service is running');
}

runTests().catch(console.error);
