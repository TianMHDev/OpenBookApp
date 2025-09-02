/**
 * Environment Variables Checker
 * Script to verify environment variables and database configuration
 */

import { dbConfig } from './backend/config/vercel.js';

console.log('🔍 ===== ENVIRONMENT VARIABLES CHECK =====');
console.log('');

console.log('📊 Database Configuration:');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('User:', dbConfig.user);
console.log('Has Password:', !!dbConfig.password);
console.log('SSL:', dbConfig.ssl ? 'Enabled' : 'Disabled');
console.log('');

console.log('🔧 Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

console.log('🚀 Application Config:');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('');

// Test DNS resolution
console.log('🌐 DNS Resolution Test:');
const dns = await import('dns');
const { promisify } = await import('util');

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

try {
  console.log('Testing DNS for:', dbConfig.host);
  const addresses = await resolve4(dbConfig.host);
  console.log('✅ DNS Resolution successful:', addresses);
} catch (error) {
  console.log('❌ DNS Resolution failed:', error.message);
  
  // Try alternative resolution
  try {
    console.log('Trying alternative DNS resolution...');
    const addresses6 = await resolve6(dbConfig.host);
    console.log('✅ IPv6 DNS Resolution successful:', addresses6);
  } catch (error6) {
    console.log('❌ IPv6 DNS Resolution also failed:', error6.message);
  }
}

console.log('');
console.log('🔍 ===== END OF CHECK =====');
