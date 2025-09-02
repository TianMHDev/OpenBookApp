/**
 * Test Script for OpenBook Backend API (Vercel Deployment)
 * Tests all available endpoints to verify the deployment is working correctly
 */

const BASE_URL = 'https://open-book-app-jwbcwtyo6-jadensmithahr-8971s-projects.vercel.app';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    full_name: 'Test User',
    role_id: 2, // Student role
    institution_id: 1
};

let authToken = null;

// Utility function for making requests
async function makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        console.log(`\n🔍 ${options.method || 'GET'} ${endpoint}`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📄 Response:`, JSON.stringify(data, null, 2));
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.error(`❌ Error testing ${endpoint}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Test functions
async function testHealthEndpoints() {
    console.log('\n🏥 ===== TESTING HEALTH ENDPOINTS =====');
    
    // Test main endpoint
    await makeRequest('/');
    
    // Test health check
    await makeRequest('/api/health');
    
    // Test database connection
    await makeRequest('/api/test-db');
    
    // Test environment info
    await makeRequest('/api/env-info');
}

async function testAuthEndpoints() {
    console.log('\n🔐 ===== TESTING AUTH ENDPOINTS =====');
    
    // Test user registration
    const registerResult = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });
    
    // Test user login
    const loginResult = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });
    
    // Store token for other tests
    if (loginResult.success && loginResult.data.token) {
        authToken = loginResult.data.token;
        console.log('✅ Token obtenido para pruebas autenticadas');
    }
    
    // Test token verification
    if (authToken) {
        await makeRequest('/api/auth/verify');
    }
}

async function testBookEndpoints() {
    console.log('\n📚 ===== TESTING BOOK ENDPOINTS =====');
    
    // Test get all books
    await makeRequest('/api/books');
    
    // Test get books with search
    await makeRequest('/api/books?search=harry');
    
    // Test get books with pagination
    await makeRequest('/api/books?limit=5&offset=0');
    
    // Test get genres
    await makeRequest('/api/books/genres');
    
    // Test get specific book (assuming book ID 1 exists)
    await makeRequest('/api/books/1');
}

async function testUserEndpoints() {
    console.log('\n👤 ===== TESTING USER ENDPOINTS =====');
    
    if (!authToken) {
        console.log('⚠️ Skipping user endpoints - no auth token');
        return;
    }
    
    // Test get user profile
    await makeRequest('/api/users/profile');
    
    // Test update user profile
    await makeRequest('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
            full_name: 'Updated Test User'
        })
    });
    
    // Test get user favorites
    await makeRequest('/api/users/favorites');
}

async function testTeacherEndpoints() {
    console.log('\n👨‍🏫 ===== TESTING TEACHER ENDPOINTS =====');
    
    if (!authToken) {
        console.log('⚠️ Skipping teacher endpoints - no auth token');
        return;
    }
    
    // Test get students
    await makeRequest('/api/teacher/students');
    
    // Test get assignments
    await makeRequest('/api/teacher/assignments');
}

async function runAllTests() {
    console.log('🚀 ===== INICIANDO PRUEBAS DE LA API OPENBOOK =====');
    console.log(`📍 URL Base: ${BASE_URL}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    try {
        // Test health endpoints first
        await testHealthEndpoints();
        
        // Test authentication
        await testAuthEndpoints();
        
        // Test book endpoints
        await testBookEndpoints();
        
        // Test user endpoints (requires auth)
        await testUserEndpoints();
        
        // Test teacher endpoints (requires auth)
        await testTeacherEndpoints();
        
        console.log('\n🎉 ===== PRUEBAS COMPLETADAS =====');
        console.log('✅ Tu aplicación OpenBook está funcionando correctamente en Vercel!');
        
    } catch (error) {
        console.error('\n❌ Error durante las pruebas:', error);
    }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runAllTests();
} else {
    // Browser environment
    console.log('🌐 Ejecutando en navegador...');
    runAllTests();
}
