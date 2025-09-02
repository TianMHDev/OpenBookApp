// ============================================================================
// CATALOG JAVASCRIPT
// ============================================================================

const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_BOOKS = `${API_ROOT}/books`;
const ENDPOINT_ASSIGN_BOOK = `${API_ROOT}/teacher/assign`;

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
  console.log("🚀 Inicializando catálogo...");
  
  // Cargar datos del usuario
  loadUserInfo();
  
  // Cargar catálogo
  loadCatalog();
  
  // Configurar eventos
  setupEventListeners();
  
  console.log("✅ Catálogo inicializado");
});

// ---------------- USER INFO ----------------
async function loadUserInfo() {
  try {
    const response = await authFetch(`${API_ROOT}/teacher/dashboard`);
    
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
  
  booksGrid.innerHTML = booksToShow.map(book => `
    <div class="book-card" data-book-id="${book.book_id}">
      <div class="book-cover-container">
        <img src="${esc(book.cover_url || '/api/placeholder/180/260')}" alt="${esc(book.title)}" class="book-cover">
        <div class="book-actions">
          <button class="action-btn-small favorite-btn" onclick="toggleFavorite(${book.book_id})" title="Agregar a favoritos">
            <i class="bi bi-heart"></i>
          </button>
          <button class="action-btn-small assign-btn" onclick="showAssignModal(${book.book_id}, '${esc(book.title)}')" title="Asignar libro">
            <i class="bi bi-send"></i>
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
  `).join('');
  
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
  
  // Logout
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

// ---------------- BOOK ACTIONS ----------------
function toggleFavorite(bookId) {
  console.log("❤️ Toggle favorite:", bookId);
  // TODO: Implementar favoritos
  alert('Función de favoritos próximamente');
}

function showAssignModal(bookId, bookTitle) {
  console.log("📖 Mostrando modal de asignación:", { bookId, bookTitle });
  
  // Crear modal de asignación
  const modal = document.createElement('div');
  modal.className = 'assign-modal';
  modal.innerHTML = `
    <div class="assign-modal-content">
      <div class="assign-modal-header">
        <h3>Asignar Libro</h3>
        <button class="close-btn" onclick="closeAssignModal()">&times;</button>
      </div>
      <div class="assign-modal-body">
        <div class="book-info-assign">
          <p><strong>Libro:</strong> ${esc(bookTitle)}</p>
        </div>
        <div class="form-group">
          <label for="assignStudentEmail">Correo del Estudiante</label>
          <div class="search-wrapper">
            <div class="input-with-icon">
              <i class="bi bi-envelope"></i>
              <input type="email" id="assignStudentEmail" placeholder="estudiante@ejemplo.com"
                  class="form-input" autocomplete="off">
            </div>
            <div class="search-results" id="assignStudentResults" style="display: none;">
              <!-- Results populated with JS -->
            </div>
          </div>
        </div>
      </div>
      <div class="assign-modal-footer">
        <button class="btn-secondary" onclick="closeAssignModal()">Cancelar</button>
        <button class="btn-primary" onclick="assignBook(${bookId}, '${esc(bookTitle)}')">Asignar Libro</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Agregar estilos CSS inline
  const style = document.createElement('style');
  style.textContent = `
    .assign-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .assign-modal-content {
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .assign-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .assign-modal-header h3 {
      margin: 0;
      color: #1f2937;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }
    .assign-modal-body {
      padding: 1.5rem;
    }
    .book-info-assign {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .book-info-assign p {
      margin: 0.5rem 0;
      color: #374151;
    }
    .assign-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `;
  document.head.appendChild(style);
  
  // Configurar búsqueda de estudiantes en el modal
  setupStudentSearchInModal();
}

function setupStudentSearchInModal() {
  const studentEmailInput = document.getElementById('assignStudentEmail');
  const studentResults = document.getElementById('assignStudentResults');
  
  if (!studentEmailInput || !studentResults) return;
  
  let searchTimeout;
  studentEmailInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      studentResults.style.display = 'none';
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      try {
        const response = await authFetch(`${API_ROOT}/teacher/students/search?search=${encodeURIComponent(query)}&limit=5`);
        
        if (response.success && response.data) {
          const students = response.data.students || response.data;
          
          if (students.length === 0) {
            studentResults.innerHTML = '<div class="no-results">No se encontraron estudiantes</div>';
          } else {
            studentResults.innerHTML = students.map(student => `
              <div class="student-result" data-student-email="${esc(student.email)}" data-student-name="${esc(student.full_name)}">
                <div class="student-info">
                  <strong>${esc(student.full_name)}</strong>
                  <small>${esc(student.email)}</small>
                </div>
              </div>
            `).join('');
            
            // Configurar eventos de clic
            studentResults.querySelectorAll('.student-result').forEach(result => {
              result.addEventListener('click', () => {
                const studentEmail = result.dataset.studentEmail;
                studentEmailInput.value = studentEmail;
                studentResults.style.display = 'none';
              });
            });
          }
          
          studentResults.style.display = 'block';
        }
      } catch (error) {
        console.error("❌ Error buscando estudiantes:", error);
        studentResults.innerHTML = '<div class="error">Error al buscar estudiantes</div>';
        studentResults.style.display = 'block';
      }
    }, 300);
  });
  
  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      studentResults.style.display = 'none';
    }
  });
}

function closeAssignModal() {
  const modal = document.querySelector('.assign-modal');
  if (modal) {
    modal.remove();
  }
}

async function assignBook(bookId, bookTitle) {
  const studentEmail = document.getElementById('assignStudentEmail')?.value.trim();
  
  if (!studentEmail) {
    alert('Por favor ingresa el correo del estudiante');
    return;
  }
  
  try {
    console.log("📖 Asignando libro:", { bookId, bookTitle, studentEmail });
    
    const response = await authFetch(ENDPOINT_ASSIGN_BOOK, {
      method: 'POST',
      body: JSON.stringify({
        studentEmail: studentEmail,
        bookId: bookId
      })
    });
    
    if (response.success) {
      alert(`Libro "${bookTitle}" asignado exitosamente a ${studentEmail}`);
      closeAssignModal();
    } else {
      alert(response.message || 'Error al asignar libro');
    }
  } catch (error) {
    console.error("❌ Error asignando libro:", error);
    alert('Error al asignar libro: ' + error.message);
  }
}

// ---------------- GLOBAL FUNCTIONS ----------------
window.toggleFavorite = toggleFavorite;
window.showAssignModal = showAssignModal;
window.closeAssignModal = closeAssignModal;
window.assignBook = assignBook;
window.changePage = changePage;
