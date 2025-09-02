import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { dbConfig } from '../config/vercel.js';

dotenv.config(); // Loading Environment Variables from the .env File

// Creating a MySQL Database Connection Pool
// Using Environment Variables for Configuration
// Make sure the environment variables are defined in your .env file
// and that the .env file is in the project root.

export const pool = mysql.createPool(dbConfig);

export const checkConnection = async () => {
  try {
    const connection = await pool.getConnection(); // get connection
    console.log('✅ Connection to MySQL established');
    console.log(`📊 Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release(); // release connection
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MySQL:', error.message);
    console.error('🔧 Please check your database configuration and environment variables');
    return false;
  }
};

// Enhanced connection check with retry logic
export const initializeDatabase = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 Attempting database connection (${i + 1}/${maxRetries})...`);
    
    if (await checkConnection()) {
      return true;
    }
    
    if (i < maxRetries - 1) {
      console.log(`⏳ Retrying in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error('❌ Failed to connect to database after all retries');
  return false;
};

// Initialize connection on module load
checkConnection();