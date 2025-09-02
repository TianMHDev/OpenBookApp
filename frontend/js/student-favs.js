// ============================================================================
// STUDENT FAVORITES JAVASCRIPT
// ============================================================================

const API_ROOT = window.APP_CONFIG ? window.APP_CONFIG.apiBaseUrl : 'http://localhost:3000/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_FAVORITES = `${API_ROOT}/books/user/favorites`;
const ENDPOINT_DASHBOARD = `${API_ROOT}/users/dashboard`;

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
let favoritesState = {
  favorites: [],
  filteredFavorites: [],
  searchTerm: '',
  loading: false
};

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Inicializando Favoritos...");
  
  // Cargar datos del usuario
  loadUserInfo();
  
  // Cargar favoritos
  loadFavorites();
  
  // Configurar eventos
  setupEventListeners();
  
  // Configurar logout
  setupLogout();
  
  console.log("✅ Favoritos inicializado");
});

// ---------------- USER INFO ----------------
async function loadUserInfo() {
  try {
    const response = await authFetch(ENDPOINT_DASHBOARD);
    
    if (response.success && response.data && response.data.user) {
      const user = response.data.user;
      
      // Actualizar información del usuario en el sidebar
      const userName = document.querySelector('.user-name');
      const userRole = document.querySelector('.user-role');
      const userGrade = document.querySelector('.user-grade');
      
      if (userName) userName.textContent = esc(user.full_name);
      if (userRole) userRole.textContent = 'Estudiante';
      if (userGrade) userGrade.textContent = esc(user.institution_name || '');
      
      console.log("✅ Información del usuario actualizada:", user);
    }
  } catch (error) {
    console.error("❌ Error cargando información del usuario:", error);
  }
}

// ---------------- FAVORITES LOADING ----------------
async function loadFavorites() {
  console.log("❤️ Cargando favoritos...");
  
  favoritesState.loading = true;
  updateLoadingState(true);
  
  try {
    const response = await authFetch(ENDPOINT_FAVORITES);
    console.log("✅ Favoritos cargados:", response);
    
    if (response.success && response.data) {
      favoritesState.favorites = response.data;
      favoritesState.filteredFavorites = [...response.data];
      
      renderFavorites();
    } else {
      console.log("⚠️ Respuesta de favoritos sin datos válidos");
      favoritesState.favorites = [];
      favoritesState.filteredFavorites = [];
      renderFavorites();
    }
  } catch (error) {
    console.error("❌ Error cargando favoritos:", error);
    favoritesState.favorites = [];
    favoritesState.filteredFavorites = [];
    renderFavorites();
  } finally {
    favoritesState.loading = false;
    updateLoadingState(false);
  }
}

function updateLoadingState(loading) {
  const favoritesGrid = document.querySelector('.favorites-grid');
  const searchInput = document.querySelector('.search-input');
  
  if (loading) {
    if (favoritesGrid) favoritesGrid.innerHTML = '<div class="loading-message">Cargando favoritos...</div>';
    if (searchInput) searchInput.disabled = true;
  } else {
    if (searchInput) searchInput.disabled = false;
  }
}

// ---------------- RENDERING ----------------
function renderFavorites() {
  console.log("🎨 Renderizando favoritos...");
  
  const favoritesGrid = document.querySelector('.favorites-grid');
  if (!favoritesGrid) {
    console.log("⚠️ Grid de favoritos no encontrado");
    return;
  }
  
  if (favoritesState.filteredFavorites.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="no-results">
        <i class="bi bi-heart" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No tienes favoritos</h3>
        <p>Explora el catálogo y agrega libros a tus favoritos</p>
        <a href="../views/student-catalog.html" class="btn-primary">Explorar Catálogo</a>
      </div>
    `;
    return;
  }
  
  favoritesGrid.innerHTML = favoritesState.filteredFavorites.map(favorite => `
    <div class="favorite-card" data-book-id="${favorite.book_id}">
      <div class="favorite-book-cover">
        <img src="${esc(favorite.cover_url || '/api/placeholder/120/180')}" alt="${esc(favorite.title)}" class="book-cover-img">
        <div class="favorite-overlay">
          <button class="btn-remove-favorite" onclick="removeFavorite(${favorite.book_id})" title="Remover de favoritos">
            <i class="bi bi-heart-fill"></i>
          </button>
          <div class="reading-status ${favorite.progress >= 100 ? 'completed' : favorite.progress > 0 ? 'in-progress' : 'pending'}">
            <i class="bi bi-${favorite.progress >= 100 ? 'check-circle-fill' : favorite.progress > 0 ? 'play-circle-fill' : 'book'}"></i>
          </div>
        </div>
      </div>
      <div class="favorite-card-content">
        <h4 class="favorite-book-title">${esc(favorite.title)}</h4>
        <p class="favorite-book-author">${esc(favorite.author || 'Autor desconocido')}</p>
        <div class="favorite-stats">
          <span class="favorite-stat">
            <i class="bi bi-star-fill"></i>
            ${favorite.rating || 'N/A'}
          </span>
          <span class="favorite-stat">
            <i class="bi bi-book"></i>
            ${favorite.pages || 'N/A'} págs
          </span>
        </div>
        <div class="favorite-actions">
          <button class="btn-read-book" onclick="startReading(${favorite.book_id}, '${esc(favorite.title)}')">
            <i class="bi bi-book-half"></i>
            ${favorite.progress > 0 ? 'Continuar' : 'Leer'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  console.log("✅ Favoritos renderizados");
}

// ---------------- SEARCH AND FILTERING ----------------
function performSearch() {
  const searchTerm = favoritesState.searchTerm.toLowerCase().trim();
  
  if (searchTerm === '') {
    favoritesState.filteredFavorites = [...favoritesState.favorites];
  } else {
    favoritesState.filteredFavorites = favoritesState.favorites.filter(favorite => {
      const title = (favorite.title || '').toLowerCase();
      const author = (favorite.author || '').toLowerCase();
      
      return title.includes(searchTerm) || 
             author.includes(searchTerm);
    });
  }
  
  // Renderizar
  renderFavorites();
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
  // Búsqueda
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      favoritesState.searchTerm = e.target.value;
      
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);
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

// ---------------- FAVORITE ACTIONS ----------------
async function removeFavorite(bookId) {
  console.log("❤️ Removiendo de favoritos:", bookId);
  
  try {
    const response = await authFetch(`${API_ROOT}/books/user/favorites/${bookId}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      // Remover del estado local
      favoritesState.favorites = favoritesState.favorites.filter(fav => fav.book_id !== bookId);
      favoritesState.filteredFavorites = favoritesState.filteredFavorites.filter(fav => fav.book_id !== bookId);
      
      // Re-renderizar
      renderFavorites();
      
      console.log("✅ Libro removido de favoritos");
    } else {
      alert(response.message || 'Error al remover de favoritos');
    }
  } catch (error) {
    console.error("❌ Error removiendo de favoritos:", error);
    alert('Error al remover de favoritos: ' + error.message);
  }
}

function startReading(bookId, bookTitle) {
  console.log("📖 Comenzando lectura:", { bookId, bookTitle });
  // TODO: Implementar vista de lectura
  alert(`Vista de lectura próximamente para "${bookTitle}"`);
}

// ---------------- GLOBAL FUNCTIONS ----------------
window.removeFavorite = removeFavorite;
window.startReading = startReading;
