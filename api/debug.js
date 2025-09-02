// Debug endpoint to identify issues
export default function handler(req, res) {
  console.log('🔍 Debug endpoint called');
  
  try {
    // Test basic functionality
    const debugInfo = {
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        path: req.path,
        headers: Object.keys(req.headers || {})
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        port: process.env.PORT || 'unknown'
      },
      database: {
        hasDbHost: !!process.env.DB_HOST,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        hasDbName: !!process.env.DB_NAME,
        hasDbPort: !!process.env.DB_PORT,
        dbHost: process.env.DB_HOST || 'not set',
        dbName: process.env.DB_NAME || 'not set'
      },
      jwt: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtExpiresIn: !!process.env.JWT_EXPIRES_IN
      },
      imports: {
        canImportExpress: typeof require !== 'undefined',
        canImportCors: typeof require !== 'undefined'
      }
    };
    
    console.log('🔍 Debug info:', JSON.stringify(debugInfo, null, 2));
    
    res.status(200).json(debugInfo);
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed',
      error: error.message,
      stack: error.stack
    });
  }
}
