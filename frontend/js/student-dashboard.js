// ============================================================================
// STUDENT DASHBOARD JAVASCRIPT
// ============================================================================

const API_ROOT = window.APP_CONFIG ? window.APP_CONFIG.apiBaseUrl : 'http://localhost:3000/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_DASHBOARD = `${API_ROOT}/users/dashboard`;
const ENDPOINT_FAVORITES = `${API_ROOT}/books/user/favorites`;
const ENDPOINT_ASSIGNMENTS = `${API_ROOT}/users/assignments`;

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
let dashboardState = {
  user: null,
  favorites: [],
  assignments: [],
  loading: false
};

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Inicializando dashboard del estudiante...");
  
  // Cargar datos del dashboard
  loadDashboard();
  
  // Cargar favoritos
  loadFavorites();
  
  // Cargar asignaciones
  loadAssignments();
  
  // Configurar logout
  setupLogout();
  
  // Configurar eventos
  setupEventListeners();
  
  console.log("✅ Dashboard del estudiante inicializado");
});

// ---------------- DASHBOARD LOADING ----------------
async function loadDashboard() {
  console.log("📊 Cargando dashboard...");
  
  dashboardState.loading = true;
  
  try {
    const response = await authFetch(ENDPOINT_DASHBOARD);
    console.log("✅ Dashboard cargado:", response);
    
    if (response.success && response.data) {
      dashboardState.user = response.data.user;
      renderUserInfo(response.data);
      renderRecentActivity(response.data.recentActivity || []);
    } else {
      console.log("⚠️ Respuesta del dashboard sin datos válidos");
      showErrorMessage("Error al cargar los datos del dashboard");
    }
  } catch (error) {
    console.error("❌ Error cargando dashboard:", error);
    showErrorMessage("Error al cargar el dashboard");
    if (error.message === 'No autorizado') {
      window.location.href = '/login.html';
    }
  } finally {
    dashboardState.loading = false;
  }
}

function renderUserInfo(data) {
  if (data.user) {
    // Actualizar información del usuario en el sidebar
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    const userGrade = document.querySelector('.user-grade');
    
    if (userName) userName.textContent = esc(data.user.full_name);
    if (userRole) userRole.textContent = 'Estudiante';
    if (userGrade) userGrade.textContent = esc(data.user.institution_name || '');
    
    // Actualizar título de bienvenida
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerHTML = `¡Bienvenido, <span>${esc(data.user.full_name)}</span>! 👨‍🎓`;
    }
    
    console.log("✅ Información del usuario actualizada:", data.user);
  }
}

function renderStats(data) {
  // Actualizar estadísticas si están disponibles
  const statsValues = document.querySelectorAll('.stat-value');
  
  if (statsValues.length >= 3) {
    statsValues[0].textContent = data.totalBooks || 0;
    statsValues[1].textContent = data.totalFavorites || 0;
    statsValues[2].textContent = data.totalCompleted || 0;
  }
}

// ---------------- RECENT ACTIVITY RENDERING ----------------
function renderRecentActivity(activities) {
  const activityTimeline = document.getElementById('activityTimeline');
  if (!activityTimeline) return;
  
  if (activities.length === 0) {
    activityTimeline.innerHTML = `
      <div class="no-activity">
        <i class="bi bi-activity" style="font-size: 2rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <p>No hay actividad reciente</p>
        <small>Tu actividad aparecerá aquí cuando comiences a leer</small>
      </div>
    `;
    return;
  }
  
  activityTimeline.innerHTML = activities.map(activity => {
    const icon = getActivityIcon(activity.type);
    const text = getActivityText(activity);
    const date = formatDate(activity.date);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="bi ${icon}"></i>
        </div>
        <div class="activity-content">
          <p class="activity-text">${text}</p>
          <span class="activity-date">${date}</span>
        </div>
      </div>
    `;
  }).join('');
}

function getActivityIcon(type) {
  switch (type) {
    case 'reading': return 'bi-book';
    case 'favorite': return 'bi-heart';
    case 'completed': return 'bi-check-circle';
    case 'assignment': return 'bi-person-check';
    default: return 'bi-activity';
  }
}

function getActivityText(activity) {
  switch (activity.type) {
    case 'reading':
      return `Comenzaste a leer <strong>${esc(activity.title)}</strong>`;
    case 'favorite':
      return `Agregaste <strong>${esc(activity.title)}</strong> a tus favoritos`;
    case 'completed':
      return `Completaste <strong>${esc(activity.title)}</strong>`;
    case 'assignment':
      return `Te asignaron <strong>${esc(activity.title)}</strong>`;
    default:
      return `Actividad: ${esc(activity.title)}`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Hoy';
  } else if (diffDays === 2) {
    return 'Ayer';
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}

// ---------------- FAVORITES LOADING ----------------
async function loadFavorites() {
  console.log("❤️ Cargando favoritos...");
  
  try {
    const response = await authFetch(ENDPOINT_FAVORITES);
    console.log("✅ Favoritos cargados:", response);
    
    if (response.success && response.data) {
      dashboardState.favorites = response.data;
      renderFavorites(response.data);
    } else {
      console.log("⚠️ Respuesta de favoritos sin datos válidos");
      dashboardState.favorites = [];
      renderFavorites([]);
    }
  } catch (error) {
    console.error("❌ Error cargando favoritos:", error);
    dashboardState.favorites = [];
    renderFavorites([]);
  }
}

function renderFavorites(favorites) {
  const favoritesGrid = document.querySelector('.reading-cards-grid');
  if (!favoritesGrid) return;
  
  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="no-favorites">
        <i class="bi bi-heart" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No tienes favoritos</h3>
        <p>Explora el catálogo y agrega libros a tus favoritos</p>
        <a href="../views/student-catalog.html" class="btn-primary">Explorar Catálogo</a>
      </div>
    `;
    return;
  }
  
  // Mostrar solo los primeros 3 favoritos en el dashboard
  const displayFavorites = favorites.slice(0, 3);
  
  favoritesGrid.innerHTML = displayFavorites.map(book => `
    <div class="reading-card">
      <div class="book-cover-wrapper">
        <img src="${esc(book.cover_url || '/api/placeholder/150/220')}" alt="${esc(book.title)}" class="book-cover">
        <div class="reading-progress-overlay">
          <span class="progress-text">${book.progress || 0}%</span>
        </div>
      </div>
      <div class="reading-card-content">
        <h4 class="book-title">${esc(book.title)}</h4>
        <p class="book-author">${esc(book.author || 'Autor desconocido')}</p>
        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${book.progress || 0}%;"></div>
          </div>
        </div>
        <div class="reading-stats">
          <span class="stat-item">
            <i class="bi bi-clock"></i>
            ${calculateRemainingTime(book.progress || 0)} restantes
          </span>
        </div>
        <button class="btn-continue-reading" onclick="continueReading(${book.book_id})">
          Continuar Leyendo
          <i class="bi bi-arrow-right-circle"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function calculateRemainingTime(progress) {
  // Estimación simple basada en progreso
  const totalHours = 8; // Estimación de tiempo total de lectura
  const remainingHours = Math.round((100 - progress) / 100 * totalHours * 10) / 10;
  return `${remainingHours}h`;
}

// ---------------- ASSIGNMENTS LOADING ----------------
async function loadAssignments() {
  console.log("📚 Cargando asignaciones...");
  
  try {
    const response = await authFetch(ENDPOINT_ASSIGNMENTS);
    console.log("✅ Asignaciones cargadas:", response);
    
    if (response.success && response.data) {
      dashboardState.assignments = response.data;
      renderAssignments(response.data);
    } else {
      console.log("⚠️ Respuesta de asignaciones sin datos válidos");
      dashboardState.assignments = [];
      renderAssignments([]);
    }
  } catch (error) {
    console.error("❌ Error cargando asignaciones:", error);
    dashboardState.assignments = [];
    renderAssignments([]);
  }
}

function renderAssignments(assignments) {
  const assignmentsTbody = document.querySelector('.books-table tbody');
  if (!assignmentsTbody) return;
  
  if (assignments.length === 0) {
    assignmentsTbody.innerHTML = `
      <tr>
        <td colspan="4" class="no-assignments">
          <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <i class="bi bi-book" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>No tienes libros asignados</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  assignmentsTbody.innerHTML = assignments.map(assignment => `
    <tr>
      <td>
        <div class="book-info-cell">
          <img src="${esc(assignment.cover_url || '/api/placeholder/40/60')}" alt="Cover" class="book-thumb">
          <div>
            <h5>${esc(assignment.bookTitle)}</h5>
            <p>${esc(assignment.author || 'Autor desconocido')}</p>
          </div>
        </div>
      </td>
      <td>${esc(assignment.teacherName || 'Profesor')}</td>
      <td>
        <div class="progress-cell">
          <div class="mini-progress-bar">
            <div class="progress-fill" style="width: ${assignment.progress || 0}%;"></div>
          </div>
          <span>${assignment.progress || 0}%</span>
        </div>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(assignment.status)}">${getStatusText(assignment.status)}</span>
      </td>
    </tr>
  `).join('');
}

function getStatusClass(status) {
  switch (status) {
    case 'completed': return 'completed';
    case 'in_progress': return 'in-progress';
    case 'pending': return 'pending';
    default: return 'pending';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'completed': return 'Completado';
    case 'in_progress': return 'En Progreso';
    case 'pending': return 'Pendiente';
    default: return 'Pendiente';
  }
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
  // Filtros de asignaciones
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Remover clase active de todos los tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      
      // Agregar clase active al tab clickeado
      e.target.classList.add('active');
      
      // Aplicar filtro
      const filter = e.target.textContent.toLowerCase();
      filterAssignments(filter);
    });
  });
  
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

function filterAssignments(filter) {
  const assignments = dashboardState.assignments;
  let filteredAssignments = [];
  
  switch (filter) {
    case 'todos':
      filteredAssignments = assignments;
      break;
    case 'pendientes':
      filteredAssignments = assignments.filter(a => a.status === 'pending');
      break;
    case 'en progreso':
      filteredAssignments = assignments.filter(a => a.status === 'in_progress');
      break;
    case 'completados':
      filteredAssignments = assignments.filter(a => a.status === 'completed');
      break;
    default:
      filteredAssignments = assignments;
  }
  
  renderAssignments(filteredAssignments);
}

// ---------------- LOGOUT FUNCTIONALITY ----------------
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log("🚪 Cerrando sesión...");
      
      // Mostrar confirmación antes de cerrar sesión
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        console.log("✅ Sesión cerrada - redirigiendo a login");
        alert('Sesión cerrada correctamente');
        window.location.href = '../views/login.html';
      }
    });
  }
}

// ---------------- STUDENT ACTIONS ----------------
function continueReading(bookId) {
  console.log("📖 Continuando lectura del libro:", bookId);
  // Redirigir a la vista de lectura del libro
  window.location.href = `../views/students-mybooks.html?book=${bookId}`;
}

// ---------------- UTILITY FUNCTIONS ----------------
function showErrorMessage(message) {
  // Crear un toast de error
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.innerHTML = `
    <i class="bi bi-exclamation-triangle"></i>
    <span>${message}</span>
  `;
  
  // Agregar estilos
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 3000);
}

function showSuccessMessage(message) {
  // Crear un toast de éxito
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <i class="bi bi-check-circle"></i>
    <span>${message}</span>
  `;
  
  // Agregar estilos
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 3000);
}

// Agregar estilos CSS para las animaciones de toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ---------------- GLOBAL FUNCTIONS ----------------
window.continueReading = continueReading;
