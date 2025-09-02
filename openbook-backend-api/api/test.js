// Simple test endpoint for Vercel
export default function handler(req, res) {
  console.log('🧪 Test endpoint called');
  
  res.status(200).json({
    success: true,
    message: 'OpenBook Backend Test Endpoint Working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbPassword: !!process.env.DB_PASSWORD,
    hasDbName: !!process.env.DB_NAME
  });
}
