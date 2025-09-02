// Minimal Vercel Serverless Function Entry Point
export default function handler(req, res) {
  console.log('🚀 OpenBook Backend handler called');
  console.log(`📥 Request: ${req.method} ${req.url}`);
  
  try {
    // Basic response
    res.status(200).json({
      success: true,
      message: 'OpenBook Backend is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      request: {
        method: req.method,
        url: req.url,
        path: req.path || 'unknown'
      },
      env: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        hasDbName: !!process.env.DB_NAME,
        hasDbPort: !!process.env.DB_PORT,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('❌ Error in handler:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}
