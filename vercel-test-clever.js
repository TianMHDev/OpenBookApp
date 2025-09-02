/**
 * Vercel Test Clever Cloud Connection
 * Simple test to verify Clever Cloud connection from Vercel
 */

import mysql from 'mysql2/promise';

// Clever Cloud configuration
const cleverCloudConfig = {
  host: 'b6snjvcp4mfobhjuwuxk-mysql.services.clever-cloud.com',
  port: 3306,
  user: 'uv331tr9mhvctrgf',
  password: 'vaZUTPVIjY0xv9Jjqqg3',
  database: 'b6snjvcp4mfobhjuwuxk',
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000,
  acquireTimeout: 10000
};

async function testCleverCloudFromVercel() {
  console.log('🔍 Testing Clever Cloud connection from Vercel...');
  console.log('================================================\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection(cleverCloudConfig);
    console.log('✅ Connection successful!');
    
    // Test basic query
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`);
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    // Test data in key tables
    console.log('\n📊 Checking data:');
    
    const keyTables = ['roles', 'institutions', 'users', 'books', 'genres'];
    for (const tableName of keyTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ${tableName}: ${count[0].count} rows`);
      } catch (error) {
        console.log(`  ${tableName}: Table not found or error`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 Clever Cloud is ready to use!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔧 This might be because:');
    console.error('1. IP not whitelisted in Clever Cloud');
    console.error('2. Database credentials are incorrect');
    console.error('3. Database is not active');
    console.error('\n💡 Try testing from Vercel deployment instead');
  }
}

// Run test
testCleverCloudFromVercel();
