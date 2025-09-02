#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'https://open-book-app-3auwusj2v-jadensmithahr-8971s-projects.vercel.app';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenBook-Test-Script'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonResponse,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    log(`\n🔍 Probando: ${name}`, 'blue');
    log(`   URL: ${url}`, 'yellow');
    
    const response = await makeRequest(url, method, data);
    
    if (response.status >= 200 && response.status < 300) {
      log(`   ✅ ÉXITO (${response.status})`, 'green');
      if (response.data && typeof response.data === 'object') {
        log(`   📊 Respuesta: ${JSON.stringify(response.data, null, 2)}`, 'green');
      }
    } else {
      log(`   ❌ ERROR (${response.status})`, 'red');
      log(`   📊 Respuesta: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    log(`   ❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 Iniciando pruebas de OpenBook Backend', 'bold');
  log(`📍 URL Base: ${BASE_URL}`, 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Health Check Principal
  const healthResult = await testEndpoint(
    'Health Check Principal',
    `${BASE_URL}/`
  );
  results.total++;
  if (healthResult) results.passed++; else results.failed++;

  // Test 2: Health Check API
  const apiHealthResult = await testEndpoint(
    'Health Check API',
    `${BASE_URL}/api/health`
  );
  results.total++;
  if (apiHealthResult) results.passed++; else results.failed++;

  // Test 3: Database Test
  const dbTestResult = await testEndpoint(
    'Database Test',
    `${BASE_URL}/api/test-db`
  );
  results.total++;
  if (dbTestResult) results.passed++; else results.failed++;

  // Test 4: Environment Info
  const envInfoResult = await testEndpoint(
    'Environment Info',
    `${BASE_URL}/api/env-info`
  );
  results.total++;
  if (envInfoResult) results.passed++; else results.failed++;

  // Test 5: Books Endpoint
  const booksResult = await testEndpoint(
    'Books Endpoint',
    `${BASE_URL}/api/books`
  );
  results.total++;
  if (booksResult) results.passed++; else results.failed++;

  // Test 6: Users Endpoint
  const usersResult = await testEndpoint(
    'Users Endpoint',
    `${BASE_URL}/api/users`
  );
  results.total++;
  if (usersResult) results.passed++; else results.failed++;

  // Test 7: Auth Register (POST)
  const registerData = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "password123",
    role: "student"
  };
  const registerResult = await testEndpoint(
    'Auth Register',
    `${BASE_URL}/api/auth/register`,
    'POST',
    registerData
  );
  results.total++;
  if (registerResult) results.passed++; else results.failed++;

  // Test 8: Auth Login (POST)
  const loginData = {
    email: "test@example.com",
    password: "password123"
  };
  const loginResult = await testEndpoint(
    'Auth Login',
    `${BASE_URL}/api/auth/login`,
    'POST',
    loginData
  );
  results.total++;
  if (loginResult) results.passed++; else results.failed++;

  // Test 9: Books Search
  const searchResult = await testEndpoint(
    'Books Search',
    `${BASE_URL}/api/books/search?q=harry+potter`
  );
  results.total++;
  if (searchResult) results.passed++; else results.failed++;

  // Resumen Final
  log('\n' + '='.repeat(50), 'bold');
  log('📊 RESUMEN DE PRUEBAS', 'bold');
  log('='.repeat(50), 'bold');
  log(`✅ Exitosas: ${results.passed}`, 'green');
  log(`❌ Fallidas: ${results.failed}`, 'red');
  log(`📈 Total: ${results.total}`, 'blue');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`📊 Tasa de éxito: ${successRate}%`, 'bold');
  
  if (results.passed === results.total) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! Tu aplicación está funcionando perfectamente.', 'green');
  } else if (results.passed >= results.total * 0.8) {
    log('\n⚠️  La mayoría de las pruebas pasaron. Revisa los errores específicos.', 'yellow');
  } else {
    log('\n❌ Hay varios problemas que necesitan atención.', 'red');
  }
  
  log('\n🔗 URL de tu aplicación:', 'blue');
  log(`${BASE_URL}`, 'yellow');
}

// Ejecutar las pruebas
runTests().catch(console.error);
