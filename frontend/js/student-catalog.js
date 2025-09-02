// ============================================================================
// STUDENT CATALOG JAVASCRIPT
// ============================================================================

const API_ROOT = window.APP_CONFIG ? window.APP_CONFIG.apiBaseUrl : 'http://localhost:3000/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_BOOKS = `${API_ROOT}/books`;
const ENDPOINT_FAVORITES = `${API_ROOT}/books/user/favorites`;

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
let catalogState = {
  books: [],
  filteredBooks: [],
  favorites: [],
  currentPage: 1,
  itemsPerPage: 20,
  totalBooks: 0,
  searchTerm: '',
  sortBy: 'title',
  sortOrder: 'asc',
  loading: false
};

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Inicializando catálogo de estudiante...");
  
  // Cargar datos del usuario
  loadUserInfo();
  
  // Cargar catálogo
  loadCatalog();
  
  // Cargar favoritos
  loadFavorites();
  
  // Configurar eventos
  setupEventListeners();
  
  // Configurar logout
  setupLogout();
  
  console.log("✅ Catálogo de estudiante inicializado");
});

// ---------------- USER INFO ----------------
async function loadUserInfo() {
  try {
    const response = await authFetch(`${API_ROOT}/users/dashboard`);
    
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

// ---------------- CATALOG LOADING ----------------
async function loadCatalog() {
  console.log("📚 Cargando catálogo...");
  
  catalogState.loading = true;
  updateLoadingState(true);
  
  try {
    // Cargar todos los libros de la base de datos
    const response = await fetch(`${ENDPOINT_BOOKS}?limit=1000`);
    const data = await response.json();
    console.log("✅ Catálogo cargado:", data);
    
    if (data.success && data.data && data.data.books) {
      catalogState.books = data.data.books;
      catalogState.totalBooks = data.data.books.length;
      catalogState.filteredBooks = [...catalogState.books];
      
      console.log(`📚 Total de libros cargados: ${catalogState.totalBooks}`);
      
      renderCatalog();
      updateResultsInfo();
    } else {
      console.log("⚠️ Respuesta del catálogo sin datos válidos");
      catalogState.books = [];
      catalogState.filteredBooks = [];
      renderCatalog();
    }
  } catch (error) {
    console.error("❌ Error cargando catálogo:", error);
    catalogState.books = [];
    catalogState.filteredBooks = [];
    renderCatalog();
  } finally {
    catalogState.loading = false;
    updateLoadingState(false);
  }
}

// ---------------- FAVORITES LOADING ----------------
async function loadFavorites() {
  console.log("❤️ Cargando favoritos...");
  
  try {
    const response = await authFetch(ENDPOINT_FAVORITES);
    console.log("✅ Favoritos cargados:", response);
    
    if (response.success && response.data) {
      catalogState.favorites = response.data;
      // Actualizar el catálogo para mostrar el estado de favoritos
      renderCatalog();
    } else {
      console.log("⚠️ Respuesta de favoritos sin datos válidos");
      catalogState.favorites = [];
    }
  } catch (error) {
    console.error("❌ Error cargando favoritos:", error);
    catalogState.favorites = [];
  }
}

function updateLoadingState(loading) {
  const booksGrid = document.getElementById('booksGrid');
  const searchInput = document.getElementById('catalogSearch');
  const sortSelect = document.getElementById('sortSelect');
  
  if (loading) {
    if (booksGrid) booksGrid.innerHTML = '<div class="loading-message">Cargando catálogo...</div>';
    if (searchInput) searchInput.disabled = true;
    if (sortSelect) sortSelect.disabled = true;
  } else {
    if (searchInput) searchInput.disabled = false;
    if (sortSelect) sortSelect.disabled = false;
  }
}

// ---------------- RENDERING ----------------
function renderCatalog() {
  console.log("🎨 Renderizando catálogo...");
  
  const booksGrid = document.getElementById('booksGrid');
  if (!booksGrid) {
    console.log("⚠️ Grid de libros no encontrado");
    return;
  }
  
  if (catalogState.filteredBooks.length === 0) {
    booksGrid.innerHTML = `
      <div class="no-results">
        <i class="bi bi-search" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
        <h3>No se encontraron libros</h3>
        <p>Intenta con otros términos de búsqueda</p>
      </div>
    `;
    return;
  }
  
  // Calcular libros para la página actual
  const startIndex = (catalogState.currentPage - 1) * catalogState.itemsPerPage;
  const endIndex = startIndex + catalogState.itemsPerPage;
  const booksToShow = catalogState.filteredBooks.slice(startIndex, endIndex);
  
  booksGrid.innerHTML = booksToShow.map(book => {
    const isFavorite = catalogState.favorites.some(fav => fav.book_id === book.book_id);
    
    return `
      <div class="book-card" data-book-id="${book.book_id}">
        <div class="book-cover-container">
          <img src="${esc(book.cover_url || '/api/placeholder/180/260')}" alt="${esc(book.title)}" class="book-cover">
          <div class="book-actions">
            <button class="action-btn-small favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${book.book_id})" title="${isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}">
              <i class="bi bi-heart${isFavorite ? '-fill' : ''}"></i>
            </button>
            <button class="action-btn-small read-btn" onclick="startReading(${book.book_id}, '${esc(book.title)}')" title="Comenzar a leer">
              <i class="bi bi-book"></i>
            </button>
          </div>
        </div>
        <div class="book-info">
          <h3 class="book-title">${esc(book.title)}</h3>
          <p class="book-author">${esc(book.author || 'Autor desconocido')}</p>
          <p class="book-year">${book.publication_year || 'Año desconocido'}</p>
          <span class="book-genre">Clásico</span>
        </div>
      </div>
    `;
  }).join('');
  
  renderPagination();
  console.log("✅ Catálogo renderizado");
}

function renderPagination() {
  const totalPages = Math.ceil(catalogState.filteredBooks.length / catalogState.itemsPerPage);
  const paginationWrapper = document.querySelector('.pagination-wrapper');
  
  if (!paginationWrapper || totalPages <= 1) {
    if (paginationWrapper) paginationWrapper.style.display = 'none';
    return;
  }
  
  paginationWrapper.style.display = 'flex';
  
  const prevBtn = paginationWrapper.querySelector('.pagination-btn:first-child');
  const nextBtn = paginationWrapper.querySelector('.pagination-btn:last-child');
  const numbersContainer = paginationWrapper.querySelector('.pagination-numbers');
  
  // Botones anterior/siguiente
  if (prevBtn) {
    prevBtn.disabled = catalogState.currentPage === 1;
    prevBtn.onclick = () => changePage(catalogState.currentPage - 1);
  }
  
  if (nextBtn) {
    nextBtn.disabled = catalogState.currentPage === totalPages;
    nextBtn.onclick = () => changePage(catalogState.currentPage + 1);
  }
  
  // Números de página
  if (numbersContainer) {
    let paginationHTML = '';
    
    if (totalPages <= 7) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
          <button class="page-number ${i === catalogState.currentPage ? 'active' : ''}" onclick="changePage(${i})">
            ${i}
          </button>
        `;
      }
    } else {
      // Mostrar páginas con elipsis
      const current = catalogState.currentPage;
      const total = totalPages;
      
      if (current <= 3) {
        // Inicio: 1, 2, 3, 4, ..., total
        for (let i = 1; i <= 4; i++) {
          paginationHTML += `
            <button class="page-number ${i === current ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
        paginationHTML += '<span class="pagination-dots">...</span>';
        paginationHTML += `
          <button class="page-number" onclick="changePage(${total})">
            ${total}
          </button>
        `;
      } else if (current >= total - 2) {
        // Final: 1, ..., total-3, total-2, total-1, total
        paginationHTML += `
          <button class="page-number" onclick="changePage(1)">
            1
          </button>
        `;
        paginationHTML += '<span class="pagination-dots">...</span>';
        for (let i = total - 3; i <= total; i++) {
          paginationHTML += `
            <button class="page-number ${i === current ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
      } else {
        // Medio: 1, ..., current-1, current, current+1, ..., total
        paginationHTML += `
          <button class="page-number" onclick="changePage(1)">
            1
          </button>
        `;
        paginationHTML += '<span class="pagination-dots">...</span>';
        for (let i = current - 1; i <= current + 1; i++) {
          paginationHTML += `
            <button class="page-number ${i === current ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
        paginationHTML += '<span class="pagination-dots">...</span>';
        paginationHTML += `
          <button class="page-number" onclick="changePage(${total})">
            ${total}
          </button>
        `;
      }
    }
    
    numbersContainer.innerHTML = paginationHTML;
  }
}

function updateResultsInfo() {
  const resultsCount = document.querySelector('.results-count');
  if (!resultsCount) return;
  
  const startIndex = (catalogState.currentPage - 1) * catalogState.itemsPerPage + 1;
  const endIndex = Math.min(startIndex + catalogState.itemsPerPage - 1, catalogState.filteredBooks.length);
  const total = catalogState.filteredBooks.length;
  
  resultsCount.textContent = `Mostrando ${startIndex}-${endIndex} de ${total} libros`;
}

// ---------------- SEARCH AND FILTERING ----------------
function performSearch() {
  const searchTerm = catalogState.searchTerm.toLowerCase().trim();
  
  if (searchTerm === '') {
    catalogState.filteredBooks = [...catalogState.books];
  } else {
    catalogState.filteredBooks = catalogState.books.filter(book => {
      const title = (book.title || '').toLowerCase();
      const author = (book.author || '').toLowerCase();
      
      return title.includes(searchTerm) || 
             author.includes(searchTerm);
    });
  }
  
  // Aplicar ordenamiento
  applySorting();
  
  // Resetear a la primera página
  catalogState.currentPage = 1;
  
  // Renderizar
  renderCatalog();
  updateResultsInfo();
}

function applySorting() {
  const { sortBy, sortOrder } = catalogState;
  
  catalogState.filteredBooks.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
        break;
      case 'author':
        aValue = (a.author || '').toLowerCase();
        bValue = (b.author || '').toLowerCase();
        break;
      case 'publication_year':
        aValue = parseInt(a.publication_year) || 0;
        bValue = parseInt(b.publication_year) || 0;
        break;
      default:
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

function changePage(page) {
  const totalPages = Math.ceil(catalogState.filteredBooks.length / catalogState.itemsPerPage);
  
  if (page < 1 || page > totalPages) return;
  
  catalogState.currentPage = page;
  renderCatalog();
  updateResultsInfo();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
  // Búsqueda
  const searchInput = document.getElementById('catalogSearch');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      catalogState.searchTerm = e.target.value;
      
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);
    });
  }
  
  // Ordenamiento
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [field, order] = e.target.value.split('-');
      catalogState.sortBy = field;
      catalogState.sortOrder = order;
      
      applySorting();
      catalogState.currentPage = 1;
      renderCatalog();
      updateResultsInfo();
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

// ---------------- BOOK ACTIONS ----------------
async function toggleFavorite(bookId) {
  console.log("❤️ Toggle favorite:", bookId);
  
  try {
    const isFavorite = catalogState.favorites.some(fav => fav.book_id === bookId);
    
    if (isFavorite) {
      // Remover de favoritos
      const response = await authFetch(`${API_ROOT}/books/user/favorites/${bookId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        catalogState.favorites = catalogState.favorites.filter(fav => fav.book_id !== bookId);
        renderCatalog();
        console.log("✅ Libro removido de favoritos");
      }
    } else {
      // Agregar a favoritos
      const response = await authFetch(`${API_ROOT}/books/user/favorites/${bookId}`, {
        method: 'POST'
      });
      
      if (response.success) {
        const book = catalogState.books.find(b => b.book_id === bookId);
        if (book) {
          catalogState.favorites.push(book);
          renderCatalog();
          console.log("✅ Libro agregado a favoritos");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error toggleando favorito:", error);
    alert('Error al actualizar favoritos: ' + error.message);
  }
}

function startReading(bookId, bookTitle) {
  console.log("📖 Comenzando lectura:", { bookId, bookTitle });
  // TODO: Implementar vista de lectura
  alert(`Vista de lectura próximamente para "${bookTitle}"`);
}

// ---------------- GLOBAL FUNCTIONS ----------------
window.toggleFavorite = toggleFavorite;
window.startReading = startReading;
window.changePage = changePage;
