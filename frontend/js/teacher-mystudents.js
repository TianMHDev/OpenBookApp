// ============================================================================
// TEACHER MY STUDENTS JAVASCRIPT
// ============================================================================

const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_STUDENTS = `${API_ROOT}/teacher/students`;
const ENDPOINT_ASSIGNMENTS = `${API_ROOT}/teacher/assignments`;
const ENDPOINT_DASHBOARD = `${API_ROOT}/teacher/dashboard`;

// ---------------- HELPERS ----------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]) : '';

// ---------------- AUTH HELPER ----------------
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No autorizado');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    throw new Error('No autorizado');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ---------------- STATE MANAGEMENT ----------------
let studentsState = {
  students: [],
  assignments: [],
  filteredStudents: [],
  currentFilter: 'all',
  searchTerm: '',
  loading: false
};

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Inicializando Mis Estudiantes...");
  
  // Cargar datos del usuario
  loadUserInfo();
  
  // Cargar estudiantes
  loadStudents();
  
  // Configurar eventos
  setupEventListeners();
  
  console.log("✅ Mis Estudiantes inicializado");
});

// ---------------- USER INFO ----------------
async function loadUserInfo() {
  try {
    const response = await authFetch(ENDPOINT_DASHBOARD);
    
    if (response.success && response.data && response.data.teacher) {
      const teacher = response.data.teacher;
      
      // Actualizar información del usuario en el sidebar
      const userName = document.querySelector('.user-name');
      const userRole = document.querySelector('.user-role');
      const userGrade = document.querySelector('.user-grade');
      
      if (userName) userName.textContent = esc(teacher.full_name);
      if (userRole) userRole.textContent = 'Maestro';
      if (userGrade) userGrade.textContent = esc(teacher.institution_name || '');
      
      console.log("✅ Información del usuario actualizada:", teacher);
    }
  } catch (error) {
    console.error("❌ Error cargando información del usuario:", error);
  }
}

// ---------------- STUDENTS LOADING ----------------
async function loadStudents() {
  console.log("👥 Cargando estudiantes...");
  
  studentsState.loading = true;
  updateLoadingState(true);
  
  try {
    // Cargar estudiantes
    const studentsResponse = await authFetch(ENDPOINT_STUDENTS);
    console.log("✅ Estudiantes cargados:", studentsResponse);
    
    // Cargar asignaciones
    const assignmentsResponse = await authFetch(ENDPOINT_ASSIGNMENTS);
    console.log("✅ Asignaciones cargadas:", assignmentsResponse);
    
    if (studentsResponse.success && studentsResponse.data) {
      studentsState.students = studentsResponse.data;
      studentsState.assignments = assignmentsResponse.success ? assignmentsResponse.data : [];
      
      // Procesar datos de estudiantes con información de asignaciones
      processStudentsData();
      
      renderStudents();
    } else {
      console.log("⚠️ Respuesta de estudiantes sin datos válidos");
      studentsState.students = [];
      studentsState.assignments = [];
      renderStudents();
    }
  } catch (error) {
    console.error("❌ Error cargando estudiantes:", error);
    studentsState.students = [];
    studentsState.assignments = [];
    renderStudents();
  } finally {
    studentsState.loading = false;
    updateLoadingState(false);
  }
}

function processStudentsData() {
  // Crear un mapa de asignaciones por estudiante
  const assignmentsByStudent = {};
  studentsState.assignments.forEach(assignment => {
    if (!assignmentsByStudent[assignment.student_id]) {
      assignmentsByStudent[assignment.student_id] = [];
    }
    assignmentsByStudent[assignment.student_id].push(assignment);
  });
  
  // Procesar cada estudiante con sus asignaciones
  studentsState.students.forEach(student => {
    const studentAssignments = assignmentsByStudent[student.user_id] || [];
    
    // Calcular estadísticas
    student.totalAssigned = studentAssignments.length;
    student.completed = studentAssignments.filter(a => a.status === 'completed').length;
    student.inProgress = studentAssignments.filter(a => a.status === 'in_progress').length;
    
    // Calcular progreso promedio
    if (student.totalAssigned > 0) {
      const totalProgress = studentAssignments.reduce((sum, a) => sum + (a.progress || 0), 0);
      student.averageProgress = Math.round(totalProgress / student.totalAssigned);
    } else {
      student.averageProgress = 0;
    }
    
    // Obtener lectura actual
    const currentReading = studentAssignments.find(a => a.status === 'in_progress');
    student.currentReading = currentReading || null;
    
    // Determinar estado del estudiante
    if (student.totalAssigned === 0) {
      student.status = 'inactive';
      student.statusText = 'Sin asignaciones';
    } else if (student.completed === student.totalAssigned) {
      student.status = 'completed';
      student.statusText = 'Completó Todo';
    } else if (student.averageProgress < 50) {
      student.status = 'behind';
      student.statusText = 'Atrasado';
    } else {
      student.status = 'active';
      student.statusText = 'Activo';
    }
  });
  
  studentsState.filteredStudents = [...studentsState.students];
}

function updateLoadingState(loading) {
  const studentsGrid = document.querySelector('.students-grid');
  const searchInput = document.querySelector('.search-input');
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  if (loading) {
    if (studentsGrid) studentsGrid.innerHTML = '<div class="loading-message">Cargando estudiantes...</div>';
    if (searchInput) searchInput.disabled = true;
    filterTabs.forEach(tab => tab.disabled = true);
  } else {
    if (searchInput) searchInput.disabled = false;
    filterTabs.forEach(tab => tab.disabled = false);
  }
}

// ---------------- RENDERING ----------------
function renderStudents() {
  console.log("🎨 Renderizando estudiantes...");
  
  const studentsGrid = document.querySelector('.students-grid');
  if (!studentsGrid) {
    console.log("⚠️ Grid de estudiantes no encontrado");
    return;
  }
  
  if (studentsState.filteredStudents.length === 0) {
    studentsGrid.innerHTML = `
      <div class="no-results">
        <i class="bi bi-people" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No se encontraron estudiantes</h3>
        <p>Intenta con otros términos de búsqueda o filtros</p>
      </div>
    `;
    return;
  }
  
  studentsGrid.innerHTML = studentsState.filteredStudents.map(student => `
    <div class="student-card" data-student-id="${student.user_id}">
      <div class="student-header">
        <div class="student-avatar-large">${getInitials(student.full_name)}</div>
        <div class="student-info">
          <h4 class="student-name">${esc(student.full_name)}</h4>
          <p class="student-email">${esc(student.email)}</p>
          <span class="student-status ${student.status}">${student.statusText}</span>
        </div>
        <div class="student-actions">
          <button class="btn-action" title="Enviar mensaje" onclick="sendMessage('${esc(student.email)}')">
            <i class="bi bi-chat-dots"></i>
          </button>
          <button class="btn-action" title="Ver detalles" onclick="viewStudentDetails(${student.user_id})">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>

      <div class="student-stats">
        <div class="stat-item">
          <span class="stat-label">Libros Asignados</span>
          <span class="stat-value">${student.totalAssigned}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completados</span>
          <span class="stat-value">${student.completed}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Progreso Promedio</span>
          <span class="stat-value">${student.averageProgress}%</span>
        </div>
      </div>

      <div class="current-reading">
        <h5 class="reading-title">${student.currentReading ? 'Lectura Actual' : 'Sin lectura activa'}</h5>
        ${student.currentReading ? `
          <div class="current-book">
            <img src="${esc(student.currentReading.cover_url || '/api/placeholder/40/60')}" alt="Book Cover" class="current-book-thumb">
            <div class="current-book-info">
              <h6>${esc(student.currentReading.bookTitle)}</h6>
              <p>${esc(student.currentReading.author)}</p>
              <div class="progress-bar">
                <div class="progress-fill ${getProgressClass(student.currentReading.progress)}" style="width: ${student.currentReading.progress || 0}%;"></div>
              </div>
              <span class="progress-text">${student.currentReading.progress || 0}% completado</span>
            </div>
          </div>
        ` : `
          <div class="no-current-reading">
            <i class="bi bi-book" style="font-size: 2rem; color: #9ca3af;"></i>
            <p>No hay lectura en progreso</p>
          </div>
        `}
      </div>
    </div>
  `).join('');
  
  console.log("✅ Estudiantes renderizados");
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getProgressClass(progress) {
  if (progress >= 80) return 'success';
  if (progress >= 50) return '';
  return 'warning';
}

// ---------------- SEARCH AND FILTERING ----------------
function performSearch() {
  const searchTerm = studentsState.searchTerm.toLowerCase().trim();
  
  if (searchTerm === '') {
    studentsState.filteredStudents = [...studentsState.students];
  } else {
    studentsState.filteredStudents = studentsState.students.filter(student => {
      const name = (student.full_name || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             email.includes(searchTerm);
    });
  }
  
  // Aplicar filtro actual
  applyCurrentFilter();
  
  // Renderizar
  renderStudents();
}

function applyCurrentFilter() {
  const { currentFilter } = studentsState;
  
  if (currentFilter === 'all') {
    // No filtrar, mantener búsqueda
    return;
  }
  
  studentsState.filteredStudents = studentsState.filteredStudents.filter(student => {
    switch (currentFilter) {
      case 'active':
        return student.status === 'active';
      case 'behind':
        return student.status === 'behind';
      case 'completed':
        return student.status === 'completed';
      default:
        return true;
    }
  });
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
  // Búsqueda
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      studentsState.searchTerm = e.target.value;
      
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);
    });
  }
  
  // Filtros
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Remover clase active de todos los tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      
      // Agregar clase active al tab clickeado
      e.target.classList.add('active');
      
      // Actualizar filtro
      studentsState.currentFilter = e.target.textContent.toLowerCase();
      
      // Aplicar filtro
      performSearch();
    });
  });
  
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
  
  // Sidebar toggle
  const sidebarOpen = document.getElementById('sidebarOpen');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarOpen) {
    sidebarOpen.addEventListener('click', () => {
      sidebar.classList.add('sidebar-open');
    });
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
    });
  }
}

// ---------------- STUDENT ACTIONS ----------------
function sendMessage(email) {
  console.log("💬 Enviando mensaje a:", email);
  // TODO: Implementar sistema de mensajería
  alert(`Función de mensajería próximamente para ${email}`);
}

function viewStudentDetails(studentId) {
  console.log("👁️ Ver detalles del estudiante:", studentId);
  // TODO: Implementar vista detallada del estudiante
  alert('Vista detallada del estudiante próximamente');
}

// ---------------- GLOBAL FUNCTIONS ----------------
window.sendMessage = sendMessage;
window.viewStudentDetails = viewStudentDetails;
