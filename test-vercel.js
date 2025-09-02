#!/usr/bin/env node

/**
 * Test script for Vercel configuration
 * Run this to verify your setup before deploying
 */

import { config } from 'dotenv';
import { dbConfig, serverConfig, corsConfig } from './backend/config/vercel.js';

// Load environment variables
config();

console.log('🧪 Testing Vercel Configuration...\n');

// Test environment variables
console.log('📋 Environment Variables:');
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`✅ PORT: ${process.env.PORT || 'not set'}`);
console.log(`✅ DB_HOST: ${process.env.DB_HOST ? '✅ set' : '❌ not set'}`);
console.log(`✅ DB_USER: ${process.env.DB_USER ? '✅ set' : '❌ not set'}`);
console.log(`✅ DB_PASSWORD: ${process.env.DB_PASSWORD ? '✅ set' : '❌ not set'}`);
console.log(`✅ DB_NAME: ${process.env.DB_NAME ? '✅ set' : '❌ not set'}`);
console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? '✅ set' : '❌ not set'}`);

console.log('\n🔧 Configuration Objects:');
console.log('Database Config:', JSON.stringify(dbConfig, null, 2));
console.log('Server Config:', JSON.stringify(serverConfig, null, 2));
console.log('CORS Config:', JSON.stringify(corsConfig, null, 2));

// Test database connection
console.log('\n🗄️ Testing Database Connection...');
try {
    const mysql = await import('mysql2/promise');
    const pool = mysql.createPool(dbConfig);
    
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Database query successful:', rows[0]);
    
    connection.release();
    await pool.end();
    
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 Make sure your database is running and accessible');
}

console.log('\n🚀 Vercel Configuration Test Complete!');
console.log('📝 Next steps:');
console.log('1. Set up your database (PlanetScale, Railway, etc.)');
console.log('2. Configure environment variables in Vercel dashboard');
console.log('3. Deploy your application');
console.log('4. Test the health endpoints: /api/health, /api/test-db');
