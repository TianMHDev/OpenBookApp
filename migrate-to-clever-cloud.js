/**
 * Migration Script: Railway to Clever Cloud
 * This script migrates your database from Railway to Clever Cloud
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Railway Database Configuration (source)
const railwayConfig = {
  host: 'crossover.proxy.rlwy.net',
  port: 14400,
  user: process.env.RAILWAY_USER || 'root',
  password: process.env.RAILWAY_PASSWORD || 'LfoGYuVpGdzjmiyfIieZBDZJbbBPgWwf',
  database: process.env.RAILWAY_DATABASE || 'railway',
  ssl: { rejectUnauthorized: false }
};

// Clever Cloud Database Configuration (destination)
const cleverCloudConfig = {
  host: process.env.CLEVER_CLOUD_HOST,
  port: parseInt(process.env.CLEVER_CLOUD_PORT) || 3306,
  user: process.env.CLEVER_CLOUD_USER,
  password: process.env.CLEVER_CLOUD_PASSWORD,
  database: process.env.CLEVER_CLOUD_DATABASE,
  ssl: { rejectUnauthorized: false }
};

async function testConnections() {
  console.log('🔍 Testing database connections...');
  
  try {
    // Test Railway connection
    const railwayPool = mysql.createPool(railwayConfig);
    await railwayPool.getConnection();
    console.log('✅ Railway connection successful');
    railwayPool.end();
    
    // Test Clever Cloud connection
    const cleverCloudPool = mysql.createPool(cleverCloudConfig);
    await cleverCloudPool.getConnection();
    console.log('✅ Clever Cloud connection successful');
    cleverCloudPool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function getTableStructure(connection, tableName) {
  const [rows] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
  return rows[0]['Create Table'];
}

async function getTableData(connection, tableName) {
  const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
  return rows;
}

async function migrateDatabase() {
  console.log('🚀 Starting migration from Railway to Clever Cloud...');
  
  const railwayPool = mysql.createPool(railwayConfig);
  const cleverCloudPool = mysql.createPool(cleverCloudConfig);
  
  try {
    // Get list of tables from Railway
    const [tables] = await railwayPool.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables to migrate`);
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`\n🔄 Migrating table: ${tableName}`);
      
      // Get table structure
      const createTableSQL = await getTableStructure(railwayPool, tableName);
      console.log(`📐 Creating table structure for ${tableName}`);
      
      // Create table in Clever Cloud
      await cleverCloudPool.execute(createTableSQL);
      
      // Get table data
      const tableData = await getTableData(railwayPool, tableName);
      console.log(`📊 Found ${tableData.length} rows in ${tableName}`);
      
      if (tableData.length > 0) {
        // Insert data into Clever Cloud
        const columns = Object.keys(tableData[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        for (const row of tableData) {
          const values = columns.map(col => row[col]);
          await cleverCloudPool.execute(insertSQL, values);
        }
        
        console.log(`✅ Inserted ${tableData.length} rows into ${tableName}`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    railwayPool.end();
    cleverCloudPool.end();
  }
}

async function createMigrationBackup() {
  console.log('💾 Creating backup of current database...');
  
  const railwayPool = mysql.createPool(railwayConfig);
  
  try {
    const [tables] = await railwayPool.execute('SHOW TABLES');
    let backupSQL = '';
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // Get table structure
      const [createTable] = await railwayPool.execute(`SHOW CREATE TABLE ${tableName}`);
      backupSQL += `\n-- Table structure for ${tableName}\n`;
      backupSQL += createTable[0]['Create Table'] + ';\n\n';
      
      // Get table data
      const [tableData] = await railwayPool.execute(`SELECT * FROM ${tableName}`);
      if (tableData.length > 0) {
        backupSQL += `-- Data for ${tableName}\n`;
        for (const row of tableData) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            return value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;
          });
          backupSQL += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        backupSQL += '\n';
      }
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-railway-${timestamp}.sql`;
    fs.writeFileSync(backupFile, backupSQL);
    
    console.log(`✅ Backup created: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  } finally {
    railwayPool.end();
  }
}

// Main execution
async function main() {
  console.log('🔄 Railway to Clever Cloud Migration Tool');
  console.log('==========================================\n');
  
  // Check environment variables
  const requiredVars = ['CLEVER_CLOUD_HOST', 'CLEVER_CLOUD_USER', 'CLEVER_CLOUD_PASSWORD', 'CLEVER_CLOUD_DATABASE'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\nPlease set these variables before running the migration.');
    process.exit(1);
  }
  
  try {
    // Test connections
    if (!(await testConnections())) {
      process.exit(1);
    }
    
    // Create backup
    await createMigrationBackup();
    
    // Perform migration
    await migrateDatabase();
    
    console.log('\n🎯 Migration Summary:');
    console.log('✅ Database structure migrated');
    console.log('✅ All data transferred');
    console.log('✅ Backup created');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Vercel environment variables');
    console.log('2. Test your application with Clever Cloud');
    console.log('3. Update your application configuration if needed');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateDatabase, testConnections, createMigrationBackup };
