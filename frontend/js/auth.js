const API_BASE_URL = 'http://localhost:3000/api/auth';
console.log("🔗 API_BASE_URL configurado:", API_BASE_URL);
console.log("📁 Archivo auth.js cargado correctamente");

// Configuring roles and their corresponding domains
const ROLE_CONFIG = {
    teacher: {
        id: 1,
        domain: '@maestro.edu.co',
        displayName: 'Maestro',
        placeholder: 'ejemplo@correo.co'
    },
    student: {
        id: 2,
        domain: '@estudiante.edu.co', 
        displayName: 'Estudiante',
        placeholder: 'ejemplo@correo.co'
    }
};

async function handleLogin(e) {
  console.log("🚀 Iniciando función handleLogin...");
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  
  console.log("📝 Datos del formulario obtenidos:");
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password ? "***" : "No password");

  if (!email || !password) {
    console.log("❌ Email o password vacíos");
    alert("Por favor ingresa tu correo y contraseña.");
    return;
  }

  try {
    console.log("Iniciando login...");
    console.log("🔗 URL de login:", `${API_BASE_URL}/login`);
    
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Respuesta del servidor:", data);
    console.log("Status de la respuesta:", res.status);
    console.log("Success en la respuesta:", data.success);

    if (!res.ok || !data.success) {
      console.log("❌ Login falló - Status:", res.status);
      console.log("❌ Login falló - Data:", data);
      alert(data.mensaje || "Error en el inicio de sesión");
      return;
    }

    // Guardar sesión en localStorage
    console.log("Guardando sesión en localStorage...");
    saveUserSession(data);
    console.log("Sesión guardada. Datos del usuario:", data.user);
    
    // Verificar que se guardó correctamente
    const savedToken = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('userData');
    console.log("🔍 Token guardado:", !!savedToken, savedToken ? savedToken.substring(0, 20) + '...' : 'No token');
    console.log("🔍 UserData guardado:", !!savedUserData, savedUserData);

    // Redirigir según rol
    const userRole = data.user.role_name || data.user.role; // por si viene distinto
    console.log("Rol del usuario:", userRole, "ID del rol:", data.user.role_id);
    
    // Verificar que el rol es correcto
    if (userRole === "maestro" || data.user.role_id === 1) {
      console.log("✅ Rol de maestro confirmado - procediendo con redirección");
    } else {
      console.log("❌ Rol incorrecto:", userRole, "ID:", data.user.role_id);
    }
    
    if (userRole === "maestro" || data.user.role_id === 1) {
      console.log("Redirigiendo a teacher dashboard...");
      console.log("URL de redirección:", "../views/teacher-dashboard.html");
      console.log("Estado actual de window.location:", window.location.href);
      
      // Verificar que no hay errores en la consola antes de redirigir
      console.log("🔍 Verificando estado antes de redirección...");
      console.log("🔍 Token en localStorage:", !!localStorage.getItem('token'));
      console.log("🔍 UserData en localStorage:", !!localStorage.getItem('userData'));
      
      try {
        console.log("🔄 Intentando redirección...");
        console.log("🔄 URL actual:", window.location.href);
        console.log("🔄 URL destino:", "../views/teacher-dashboard.html");
        
        window.location.href = "../views/teacher-dashboard.html";
        console.log("✅ Redirección iniciada...");
        
        // Verificar si la redirección se completó
        setTimeout(() => {
          console.log("⏰ Verificando redirección después de 1 segundo...");
          console.log("⏰ URL actual:", window.location.href);
          if (window.location.href.includes('login.html')) {
            console.log("❌ PROBLEMA: Sigue en login.html después de 1 segundo");
            console.log("❌ Esto indica que hay un error en el dashboard que causa redirección de vuelta");
          } else if (window.location.href.includes('teacher-dashboard.html')) {
            console.log("✅ ÉXITO: Redirección completada a teacher-dashboard.html");
          } else {
            console.log("⚠️ URL inesperada:", window.location.href);
          }
        }, 1000);
        
      } catch (error) {
        console.error("❌ Error en redirección:", error);
      }
    } else if (userRole === "estudiante" || data.user.role_id === 2) {
      console.log("Redirigiendo a student dashboard...");
      console.log("URL de redirección:", "../views/student-dashboard.html");
      window.location.href = "../views/student-dashboard.html";
    } else {
      console.log("❌ Rol desconocido:", userRole);
      console.log("❌ Datos del usuario:", data.user);
      alert("Rol desconocido, no se puede redirigir.");
    }
  } catch (error) {
    console.error("❌ Error en login:", error);
    console.error("❌ Stack trace:", error.stack);
    alert("No se pudo conectar con el servidor");
  }
}

async function handleRegister(event) {
    event.preventDefault();

    // Collect form data
    const formData = collectFormData();
    
    // Validate basic data on the client (UX only)
    const clientValidation = validateFormDataClient(formData);
    if (!clientValidation.isValid) {
        showValidationErrors(clientValidation.errors);
        return;
    }

    // Show charging status
    showLoadingState('Registrando usuario...');

    try {
        // Send data to the backend for validation and actual registration
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: formData.fullName,
                national_id: formData.nationalId,
                email: formData.email.toLowerCase(),
                password: formData.password,
                role_id: ROLE_CONFIG[formData.role].id,
                institution_id: formData.institutionId,
                institution_name: formData.institutionName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            handleRegistrationError(response.status, data);
            return;
        }

        // Successful registration
        showSuccessMessage('¡Registro exitoso! Puedes iniciar sesión ahora.');
        resetRegistrationForm();
        
        // Optional: Automatically redirect to login
        setTimeout(() => {
            window.location.href = '../views/login.html';
        }, 2000);

    } catch (error) {
        console.error('Error de conexión en registro:', error);
        showGlobalError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
        hideLoadingState();
    }
}

function validateEmailFormatUX(email, role) {
    if (!email || !role || !ROLE_CONFIG[role]) return false;
    
    const emailLowerCase = email.toLowerCase().trim();
    const expectedDomain = ROLE_CONFIG[role].domain;
    
    return emailLowerCase.endsWith(expectedDomain) && 
        emailLowerCase.length > expectedDomain.length;
}

/**
 * Validates form data on the client (UX only)
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Validation result
 */
function validateFormDataClient(formData) {
    const errors = {};
    let isValid = true;

    // Validate full name
    if (!formData.fullName || formData.fullName.length < 3) {
        errors.fullName = 'El nombre debe tener al menos 3 caracteres';
        isValid = false;
    }

    // Validate ID number (basic format)
    if (!formData.nationalId || !/^\d{7,12}$/.test(formData.nationalId)) {
        errors.nationalId = 'Número de identificación inválido (7-12 dígitos)';
        isValid = false;
    }

    // Validate email format
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Formato de correo inválido';
        isValid = false;
    }

    // Validate role-specific email domain
    if (formData.email && formData.role && !validateEmailFormatUX(formData.email, formData.role)) {
        errors.email = `El correo debe terminar en ${ROLE_CONFIG[formData.role].domain}`;
        isValid = false;
    }

    // Validate password strength
    if (!formData.password || formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
        isValid = false;
    }

    // Validate role selection
    if (!formData.role || !ROLE_CONFIG[formData.role]) {
        errors.role = 'Debes seleccionar un tipo de usuario';
        isValid = false;
    }

    return { isValid, errors };
}

/**
 * Collects form data from registration form
 * @returns {Object} - Form data object
 */
function collectFormData() {
    return {
        fullName: document.getElementById('register-fullName')?.value?.trim() || '',
        nationalId: document.getElementById('register-nationalId')?.value?.trim() || '',
        email: document.getElementById('register-email')?.value?.trim() || '',
        password: document.getElementById('register-password')?.value || '',
        role: document.getElementById('register-role')?.value || '',
        institutionId: document.getElementById('register-institutionId')?.value || '',
        institutionName: document.getElementById('register-institutionName')?.value?.trim() || ''
    };
}

/**
 * Shows validation errors in the UI
 * @param {Object} errors - Validation errors
 */
function showValidationErrors(errors) {
    // Clear previous errors
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    });

    // Show new errors
    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.color = '#dc3545';
        }
    });
}

/**
 * Shows loading state
 * @param {string} message - Loading message
 */
function showLoadingState(message) {
    const loadingElement = document.getElementById('loading-message');
    if (loadingElement) {
        loadingElement.textContent = message;
        loadingElement.style.display = 'block';
    }
}

/**
 * Hides loading state
 */
function hideLoadingState() {
    const loadingElement = document.getElementById('loading-message');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * Shows success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        successElement.style.color = '#28a745';
    }
}

/**
 * Shows global error message
 * @param {string} message - Error message
 */
function showGlobalError(message) {
    alert(message); // Simple alert for now
}

/**
 * Resets registration form
 */
function resetRegistrationForm() {
    const form = document.getElementById('register-form');
    if (form) {
        form.reset();
    }
    
    // Clear error messages
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

/**
 * Saves user session data to localStorage
 * @param {Object} sessionData - Session data from server
 */
function saveUserSession(sessionData) {
    localStorage.setItem('token', sessionData.token);
    localStorage.setItem('userData', JSON.stringify({
        email: sessionData.user.email,
        role_id: sessionData.user.role_id,
        full_name: sessionData.user.full_name,
        user_id: sessionData.user.user_id
    }));
}

/**
 * Redirects the user based on their role
 * @param {number} roleId - User role ID
 */
function redirectUserBasedOnRole(roleId) {
    if (roleId === 1) {
        window.location.href = '../views/teacher-dashboard.html';
    } else if (roleId === 2) {
        window.location.href = '../views/student-dashboard.html';
    } else {
        showGlobalError('Rol de usuario no reconocido');
    }
}

// =====================================================================
// ERROR HANDLING FUNCTIONS
// =====================================================================

/**
 * Handles login-specific errors
 * @param {number} status - HTTP status code
 * @param {Object} data - Server response data
 * @param {HTMLElement} emailError - Email error element
 * @param {HTMLElement} passwordError - Password error element
 */
function handleLoginError(status, data, emailError, passwordError) {
    switch (status) {
        case 400:
            if (data.mensaje?.includes('Email')) {
                showFieldError(emailError, 'Email requerido');
            }
            if (data.mensaje?.includes('contraseña')) {
                showFieldError(passwordError, 'Contraseña requerida');
            }
            break;
        case 401:
            showFieldError(emailError, 'Credenciales incorrectas');
            break;
        default:
            showGlobalError(data.mensaje || 'Error en el servidor');
    }
}

/**
 * Handles registry-specific errors
 * @param {number} status - HTTP status code
 * @param {Object} data - Server response data
 */
function handleRegistrationError(status, data) {
    // Backend-specific errors are displayed directly
// since the backend strictly validates everything
    const errorMessages = {
        'EMAIL_EXISTS': 'Este correo ya está registrado',
        'ID_EXISTS': 'Este número de identificación ya está registrado',
        'EMAIL_FORMAT_INVALID': 'Formato de correo inválido para el tipo de usuario',
        'ROLE_EMAIL_MISMATCH': 'El tipo de usuario no coincide con el dominio del correo',
        'WEAK_PASSWORD': 'La contraseña no cumple con los requisitos de seguridad'
    };

    const message = errorMessages[data.error] || data.mensaje || 'Error en el registro';
    showGlobalError(message);
}

// =====================================================================
// USER INTERFACE FUNCTIONS
// =====================================================================

function showFieldError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = '#dc3545';
        element.classList.add('error-active');
    }
}

function showFieldSuccess(element, message) {
    if (element) {
        element.textContent = message;
        element.style.color = '#28a745';
        element.classList.remove('error-active');
    }
}

function clearFieldError(element) {
    if (element) {
        element.textContent = '';
        element.classList.remove('error-active');
    }
}

/**
 * Verifica si el usuario está autenticado y redirige si no lo está
 */
function requireAuth() {
  console.log("🔐 Verificando autenticación...");
  console.log("🔍 URL actual:", window.location.href);
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  console.log("🔍 Token encontrado:", !!token);
  console.log("🔍 UserData encontrado:", !!userData);
  
  if (!token || !userData) {
    console.log("❌ No hay token o userData - redirigiendo a login");
    console.log("🔄 Redirigiendo a:", '../views/login.html');
    window.location.href = '../views/login.html';
    return false;
  }
  
  try {
    const user = JSON.parse(userData);
    console.log("✅ Usuario autenticado:", user);
    
    // Verificar que el usuario tiene un rol válido
    if (!user.role_id) {
      console.log("❌ Usuario sin rol - redirigiendo a login");
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '../views/login.html';
      return false;
    }
    
    // Verificar que el rol es de maestro (1) o teacher
    if (user.role_id === 1 || user.role_name === 'maestro' || user.role === 'maestro') {
      console.log("✅ Rol de maestro confirmado - usuario puede acceder");
      return true;
    } else {
      console.log("⚠️ Rol incorrecto para dashboard de maestro:", user.role_id, user.role_name);
      console.log("⚠️ Pero permitiendo acceso de todas formas para debug");
      return true; // Permitir acceso temporalmente para debug
    }
    
  } catch (error) {
    console.error("❌ Error parseando userData:", error);
    console.log("⚠️ Pero permitiendo acceso de todas formas para debug");
    return true; // Permitir acceso temporalmente para debug
  }
}

/**
 * Obtiene el token de autenticación del localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Cierra la sesión del usuario
 */
function logout() {
  console.log("🚪 Cerrando sesión...");
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  console.log("✅ Sesión cerrada - redirigiendo a login");
  window.location.href = '../views/login.html';
}

// =====================================================================
// EVENT LISTENERS
// =====================================================================

// Login form event listener
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});