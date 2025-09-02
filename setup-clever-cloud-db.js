/**
 * Setup Clever Cloud Database
 * This script sets up the OpenBook database structure in Clever Cloud
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import { dbConfig } from './backend/config/vercel.js';

async function setupCleverCloudDatabase() {
  console.log('🚀 Setting up OpenBook database in Clever Cloud...');
  console.log('================================================\n');
  
  try {
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    
    // Test connection
    console.log('🔍 Testing connection to Clever Cloud...');
    const connection = await pool.getConnection();
    console.log('✅ Connection successful!');
    
    // Read the SQL script
    console.log('📖 Reading SQL script...');
    const sqlScript = fs.readFileSync('./docs/script.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip DELIMITER statements (they're not needed for mysql2)
        if (statement.includes('DELIMITER')) {
          console.log(`⏭️  Skipping DELIMITER statement (${i + 1}/${statements.length})`);
          continue;
        }
        
        // Execute the statement
        await connection.execute(statement);
        successCount++;
        
        // Log progress for important operations
        if (statement.includes('CREATE TABLE') || statement.includes('INSERT INTO')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/) || statement.match(/INSERT INTO (\w+)/);
          if (tableName) {
            console.log(`✅ ${statement.includes('CREATE TABLE') ? 'Created' : 'Inserted data into'} table: ${tableName[1]} (${i + 1}/${statements.length})`);
          }
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
      }
    }
    
    // Create triggers manually (since DELIMITER doesn't work with mysql2)
    console.log('\n🔧 Creating triggers...');
    try {
      const triggerSQL = `
        CREATE TRIGGER after_book_assignment_update
        AFTER UPDATE ON book_assignments
        FOR EACH ROW
        BEGIN
            IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
                UPDATE book_metrics 
                SET views = views + 1
                WHERE book_id = NEW.book_id;
            END IF;
        END
      `;
      
      await connection.execute(triggerSQL);
      console.log('✅ Trigger created successfully');
      successCount++;
      
    } catch (error) {
      console.error('❌ Error creating trigger:', error.message);
      errorCount++;
    }
    
    // Verify the setup
    console.log('\n🔍 Verifying database setup...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`);
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    // Check for data in key tables
    console.log('\n📊 Checking data in key tables:');
    
    const keyTables = ['roles', 'institutions', 'users', 'books', 'genres'];
    for (const tableName of keyTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ${tableName}: ${count[0].count} rows`);
      } catch (error) {
        console.log(`  ${tableName}: Error checking count`);
      }
    }
    
    connection.release();
    pool.end();
    
    console.log('\n🎉 Database setup completed!');
    console.log(`✅ Successful operations: ${successCount}`);
    console.log(`❌ Failed operations: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎯 Your OpenBook database is ready to use!');
    } else {
      console.log('\n⚠️  Some operations failed. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your Clever Cloud credentials');
    console.error('2. Verify the database exists');
    console.error('3. Check if your IP is whitelisted');
    console.error('4. Verify SSL configuration');
    
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCleverCloudDatabase();
}

export { setupCleverCloudDatabase };
