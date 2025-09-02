
// TEACHER DASHBOARD JAVASCRIPT
const API_ROOT = window.APP_CONFIG ? window.APP_CONFIG.apiBaseUrl : 'http://localhost:3000/api';

console.log("🔗 API_ROOT configurado:", API_ROOT);

const ENDPOINT_DASHBOARD    = `${API_ROOT}/teacher/dashboard`;
const ENDPOINT_SEARCH_BOOKS = `${API_ROOT}/books`; // /books?search=...
const ENDPOINT_SEARCH_STUDENTS = `${API_ROOT}/teacher/students/search`; // /teacher/students/search?search=...
const ENDPOINT_ASSIGN_BOOK  = `${API_ROOT}/teacher/assign`; // POST { studentEmail, bookId }
const ENDPOINT_ASSIGNMENTS  = `${API_ROOT}/teacher/assignments`; // GET

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

// ---------------- UI ELEMENTS ----------------
const ui = {
  profileName: $('.profile-name'),
  profileRole: $('.profile-role'),
  profileGrade: $('.profile-grade')
};

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Inicializando dashboard del profesor...");
  
  // Cargar datos del dashboard
  loadDashboard();
  
  // Cargar asignaciones
  loadAssignments();
  
  // Configurar asignación rápida
  setupQuickAssignment();
  

  
  // Configurar logout
  setupLogout();
  
  console.log("✅ Dashboard del profesor inicializado");
});

// ---------------- DASHBOARD LOADING ----------------
async function loadDashboard() {
  console.log("📊 Cargando dashboard...");
  
  try {
    const response = await authFetch(ENDPOINT_DASHBOARD);
    console.log("✅ Dashboard cargado:", response);
    
    if (response.success && response.data) {
      renderUserInfo(response.data);
    } else {
      console.log("⚠️ Respuesta del dashboard sin datos válidos");
    }
  } catch (error) {
    console.error("❌ Error cargando dashboard:", error);
    if (error.message === 'No autorizado') {
      window.location.href = '/login.html';
    }
  }
}

function renderUserInfo(d = {}) {
  // Extraer datos de la estructura correcta del backend
  const teacher = d.teacher || {};
  
  // Mostrar información del profesor desde el backend
  if (teacher && teacher.full_name) {
    // Actualizar título de bienvenida
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerHTML = `¡Bienvenido, <span>${esc(teacher.full_name)}</span>! 👨‍🏫`;
    }
    
    // Actualizar información del perfil en el sidebar
    if (ui.profileName) ui.profileName.textContent = esc(teacher.full_name);
    if (ui.profileRole) ui.profileRole.textContent = 'Maestro';
    if (ui.profileGrade) ui.profileGrade.textContent = esc(teacher.institution_name || '');
    
    console.log("✅ Información del usuario actualizada desde el backend:", teacher);
  }
}



// ---------------- ASSIGNMENTS TABLE ----------------
async function loadAssignments() {
  console.log("📚 Iniciando loadAssignments...");
  console.log("🔗 Endpoint:", ENDPOINT_ASSIGNMENTS);
  
  const assignmentsTbody = document.querySelector('.assignments-table tbody');
  if (!assignmentsTbody) {
    console.log("⚠️ Tabla de asignaciones no encontrada");
    return;
  }
  
  assignmentsTbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
  
  try {
    console.log("📡 Haciendo petición al servidor...");
    const res = await authFetch(ENDPOINT_ASSIGNMENTS);
    console.log("✅ Respuesta del servidor:", res);
    
    const assigns = Array.isArray(res) ? res : (res.data ?? res.assignments ?? []);
    console.log("📚 Asignaciones encontradas:", assigns);
    
    renderAssignments(assigns);
    console.log("📚 Asignaciones renderizadas");
    

  } catch (err) {
    console.error('❌ Error cargando asignaciones:', err);
    console.log("⚠️ Mostrando mensaje de error en lugar de redirigir");
    assignmentsTbody.innerHTML = `<tr><td colspan="5">Error al cargar asignaciones: ${err.message}</td></tr>`;
    
    // No redirigir automáticamente, solo mostrar error
    if (err.message === 'No autorizado') {
      console.log("⚠️ Token inválido - pero no redirigiendo desde dashboard");
    }
  }
}

function renderAssignments(assigns = []) {
  const assignmentsTbody = document.querySelector('.assignments-table tbody');
  if (!assignmentsTbody) return;
  
  if (!Array.isArray(assigns) || assigns.length === 0) {
    assignmentsTbody.innerHTML = `<tr><td colspan="5">No hay asignaciones</td></tr>`;
    return;
  }
  assignmentsTbody.innerHTML = assigns.map(a => {
    const student = esc(a.studentName ?? a.studentFullName ?? a.studentEmail ?? '');
    const book = esc(a.bookTitle ?? a.title ?? '');
    const progress = Number(a.progress ?? 0);
    const status = esc(a.status ?? (progress>=100 ? 'completed' : 'in_progress'));
    const assignmentId = a.assignment_id;
    
    return `<tr data-assignment-id="${assignmentId}">
      <td>
        <strong>${student.split(' ')[0] ?? student}</strong><br/>
        <small>${esc(a.studentEmail ?? a.studentEmail ?? '')}</small>
      </td>
      <td>
        <div class="book-cell">
          <img src="${esc(a.cover_url ?? a.coverUrl ?? '')}" alt="Cover" style="width:40px;height:50px;object-fit:cover;margin-right:8px;">
          <div class="book-meta"><strong>${book}</strong><br/><small>${esc(a.author ?? '')}</small></div>
        </div>
      </td>
      <td>
        <div class="progress-wrapper">
          <div class="progress-bar" style="width: ${progress}%; height:8px; background:linear-gradient(90deg,#59c9a5,#2dbd8a); border-radius:4px;"></div>
          <div style="margin-top:6px">${progress}%</div>
        </div>
      </td>
      <td><span class="status-pill">${status.replace('_',' ')}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editAssignment(${assignmentId}, '${student}', '${book}', ${progress}, '${status}')" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-delete" onclick="deleteAssignment(${assignmentId}, '${student}', '${book}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}



// ---------------- QUICK ASSIGNMENT ----------------
function setupQuickAssignment() {
  console.log("📖 Configurando asignación rápida...");
  
  const studentEmailInput = document.querySelector('#studentEmail');
  const bookSearchInput = document.querySelector('#bookSearch');
  const assignButton = document.querySelector('#assignBookBtn');
  
  console.log("🔍 Elementos encontrados:", {
    studentEmailInput: !!studentEmailInput,
    bookSearchInput: !!bookSearchInput,
    assignButton: !!assignButton
  });
  
  if (!studentEmailInput || !bookSearchInput || !assignButton) {
    console.log("⚠️ Elementos de asignación rápida no encontrados");
    return;
  }
  
  // Configurar búsqueda de estudiantes
  let studentSearchTimeout;
  studentEmailInput.addEventListener('input', (e) => {
    clearTimeout(studentSearchTimeout);
    const query = e.target.value.trim();
    
    console.log("👤 Input de búsqueda de estudiantes:", query);
    
    // Ocultar otros dropdowns
    const searchResults = document.querySelector('#searchResults');
    if (searchResults) {
      searchResults.style.display = 'none';
      searchResults.classList.remove('show');
    }
    
    if (query.length < 2) {
      console.log("⚠️ Query muy corta, limpiando resultados de estudiantes");
      const studentResults = document.querySelector('#studentResults');
      if (studentResults) {
        studentResults.innerHTML = '';
        studentResults.style.display = 'none';
        studentResults.classList.remove('show');
      }
      return;
    }
    
    studentSearchTimeout = setTimeout(async () => {
      try {
        console.log("👤 Buscando estudiantes:", query);
        console.log("🔗 URL de búsqueda de estudiantes:", `${ENDPOINT_SEARCH_STUDENTS}?search=${encodeURIComponent(query)}&limit=5`);
        
        const response = await authFetch(`${ENDPOINT_SEARCH_STUDENTS}?search=${encodeURIComponent(query)}&limit=5`);
        
        console.log("📡 Respuesta de búsqueda de estudiantes:", response);
        
        if (response.success && response.data) {
          renderStudentSearchResults(response.data.students || response.data);
        } else {
          console.log("⚠️ Respuesta de búsqueda de estudiantes sin datos válidos");
          const studentResults = document.querySelector('#studentResults');
          if (studentResults) {
            studentResults.innerHTML = '<div class="no-results">No se encontraron estudiantes</div>';
            studentResults.style.display = 'block';
            studentResults.classList.add('show');
          }
        }
      } catch (error) {
        console.error("❌ Error buscando estudiantes:", error);
        const studentResults = document.querySelector('#studentResults');
        if (studentResults) {
          studentResults.innerHTML = '<div class="error">Error al buscar estudiantes</div>';
          studentResults.style.display = 'block';
          studentResults.classList.add('show');
        }
      }
    }, 300);
  });
  
  // Configurar búsqueda de libros
  let bookSearchTimeout;
  bookSearchInput.addEventListener('input', (e) => {
    clearTimeout(bookSearchTimeout);
    const query = e.target.value.trim();
    
    console.log("📖 Input de búsqueda de libros:", query);
    
    // Ocultar otros dropdowns
    const studentResults = document.querySelector('#studentResults');
    if (studentResults) {
      studentResults.style.display = 'none';
      studentResults.classList.remove('show');
    }
    
    if (query.length < 2) {
      console.log("⚠️ Query muy corta, limpiando resultados de libros");
      const searchResults = document.querySelector('#searchResults');
      if (searchResults) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        searchResults.classList.remove('show');
      }
      return;
    }
    
    bookSearchTimeout = setTimeout(async () => {
      try {
        console.log("📖 Buscando libros:", query);
        console.log("🔗 URL de búsqueda de libros:", `${ENDPOINT_SEARCH_BOOKS}?search=${encodeURIComponent(query)}&limit=5`);
        
        const response = await authFetch(`${ENDPOINT_SEARCH_BOOKS}?search=${encodeURIComponent(query)}&limit=5`);
        
        console.log("📡 Respuesta de búsqueda de libros:", response);
        
        if (response.success && response.data) {
          renderBookSearchResults(response.data.books || response.data);
        } else {
          console.log("⚠️ Respuesta de búsqueda de libros sin datos válidos");
          const searchResults = document.querySelector('#searchResults');
          if (searchResults) {
            searchResults.innerHTML = '<div class="no-results">No se encontraron libros</div>';
            searchResults.style.display = 'block';
            searchResults.classList.add('show');
          }
        }
      } catch (error) {
        console.error("❌ Error buscando libros:", error);
        const searchResults = document.querySelector('#searchResults');
        if (searchResults) {
          searchResults.innerHTML = '<div class="error">Error al buscar libros</div>';
          searchResults.style.display = 'block';
          searchResults.classList.add('show');
        }
      }
    }, 300);
  });
  
  // Configurar botón de asignar
  assignButton.addEventListener('click', async () => {
    const studentEmail = studentEmailInput.value.trim();
    const selectedBook = bookSearchInput.dataset.selectedBookId;
    
    if (!studentEmail) {
      alert('Por favor ingresa el correo del estudiante');
      return;
    }
    
    if (!selectedBook) {
      alert('Por favor selecciona un libro');
      return;
    }
    
    try {
      console.log("📖 Asignando libro:", { studentEmail, bookId: selectedBook });
      assignButton.disabled = true;
      assignButton.textContent = 'Asignando...';
      
      const response = await authFetch(ENDPOINT_ASSIGN_BOOK, {
        method: 'POST',
        body: JSON.stringify({
          studentEmail: studentEmail,
          bookId: selectedBook
        })
      });
      
      if (response.success) {
        alert('Libro asignado exitosamente');
        // Limpiar formulario
        studentEmailInput.value = '';
        bookSearchInput.value = '';
        bookSearchInput.dataset.selectedBookId = '';
        // Recargar asignaciones
        loadAssignments();
      } else {
        alert(response.message || 'Error al asignar libro');
      }
    } catch (error) {
      console.error("❌ Error asignando libro:", error);
      alert('Error al asignar libro: ' + error.message);
    } finally {
      assignButton.disabled = false;
      assignButton.textContent = 'Asignar Libro';
    }
  });
  
  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', (e) => {
    const studentResults = document.querySelector('#studentResults');
    const searchResults = document.querySelector('#searchResults');
    
    // Si el clic no es en los inputs ni en los resultados, cerrar dropdowns
    if (!e.target.closest('.search-wrapper') && !e.target.closest('#studentResults') && !e.target.closest('#searchResults')) {
      if (studentResults) {
        studentResults.style.display = 'none';
        studentResults.classList.remove('show');
      }
      if (searchResults) {
        searchResults.style.display = 'none';
        searchResults.classList.remove('show');
      }
    }
  });
  
  // Cerrar dropdowns al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const studentResults = document.querySelector('#studentResults');
      const searchResults = document.querySelector('#searchResults');
      
      if (studentResults) {
        studentResults.style.display = 'none';
        studentResults.classList.remove('show');
      }
      if (searchResults) {
        searchResults.style.display = 'none';
        searchResults.classList.remove('show');
      }
    }
  });
}

function renderStudentSearchResults(students) {
  const studentResults = document.querySelector('#studentResults');
  console.log("🔍 Buscando elemento #studentResults:", studentResults);
  
  if (!studentResults) {
    console.log("⚠️ Elemento studentResults no encontrado");
    return;
  }
  
  console.log("👤 Renderizando resultados de búsqueda de estudiantes:", students);
  console.log("👤 Tipo de students:", typeof students);
  console.log("👤 Es array:", Array.isArray(students));
  
  // Asegurar que students sea un array
  const studentsArray = Array.isArray(students) ? students : (students?.data || students?.students || []);
  
  if (!studentsArray || studentsArray.length === 0) {
    studentResults.innerHTML = '<div class="no-results">No se encontraron estudiantes</div>';
    studentResults.style.display = 'block';
    studentResults.classList.add('show');
    return;
  }
  
  studentResults.innerHTML = studentsArray.map(student => `
    <div class="student-result" data-student-email="${esc(student.email)}" data-student-name="${esc(student.full_name)}">
      <div class="student-info">
        <strong>${esc(student.full_name)}</strong>
        <small>${esc(student.email)}</small>
      </div>
    </div>
  `).join('');
  
  // Mostrar el dropdown
  studentResults.style.display = 'block';
  studentResults.classList.add('show');
  
  // Configurar eventos de clic
  studentResults.querySelectorAll('.student-result').forEach(result => {
    result.addEventListener('click', () => {
      const studentEmail = result.dataset.studentEmail;
      const studentName = result.dataset.studentName;
      
      console.log("👤 Estudiante seleccionado:", { studentEmail, studentName });
      
      document.querySelector('#studentEmail').value = studentEmail;
      studentResults.style.display = 'none';
      studentResults.classList.remove('show');
    });
  });
}

function renderBookSearchResults(books) {
  const searchResults = document.querySelector('#searchResults');
  console.log("🔍 Buscando elemento #searchResults:", searchResults);
  
  if (!searchResults) {
    console.log("⚠️ Elemento searchResults no encontrado");
    return;
  }
  
  console.log("📚 Renderizando resultados de búsqueda:", books);
  console.log("📚 Tipo de books:", typeof books);
  console.log("📚 Es array:", Array.isArray(books));
  
  // Asegurar que books sea un array
  const booksArray = Array.isArray(books) ? books : (books?.data || books?.books || []);
  
  if (!booksArray || booksArray.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No se encontraron libros</div>';
    searchResults.style.display = 'block';
    searchResults.classList.add('show');
    return;
  }
  
  searchResults.innerHTML = booksArray.map(book => `
    <div class="book-result" data-book-id="${book.book_id || book.id}" data-book-title="${esc(book.title)}">
      <img src="${esc(book.cover_url || book.coverUrl || '')}" alt="Cover" style="width:30px;height:40px;object-fit:cover;">
      <div class="book-info">
        <strong>${esc(book.title)}</strong>
        <small>${esc(book.author || '')}</small>
      </div>
    </div>
  `).join('');
  
  // Mostrar el dropdown
  searchResults.style.display = 'block';
  searchResults.classList.add('show');
  
  // Configurar eventos de clic
  searchResults.querySelectorAll('.book-result').forEach(result => {
    result.addEventListener('click', () => {
      const bookId = result.dataset.bookId;
      const bookTitle = result.dataset.bookTitle;
      
      console.log("📖 Libro seleccionado:", { bookId, bookTitle });
      
      document.querySelector('#bookSearch').value = bookTitle;
      document.querySelector('#bookSearch').dataset.selectedBookId = bookId;
      searchResults.style.display = 'none';
      searchResults.classList.remove('show');
    });
  });
}

// ---------------- ASSIGNMENT CRUD OPERATIONS ----------------

// Delete assignment function
async function deleteAssignment(assignmentId, studentName, bookTitle) {
  if (!confirm(`¿Estás seguro de que quieres eliminar la asignación del libro "${bookTitle}" para ${studentName}?`)) {
    return;
  }
  
  try {
    console.log("🗑️ Eliminando asignación:", assignmentId);
    
    const response = await authFetch(`${API_ROOT}/teacher/assignments/${assignmentId}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      console.log("✅ Asignación eliminada correctamente");
      alert('Asignación eliminada correctamente');
      // Recargar asignaciones y dashboard
      loadAssignments();
      loadDashboard();
    } else {
      alert(response.message || 'Error al eliminar la asignación');
    }
  } catch (error) {
    console.error("❌ Error eliminando asignación:", error);
    alert('Error al eliminar la asignación: ' + error.message);
  }
}

// Edit assignment function
async function editAssignment(assignmentId, studentName, bookTitle, currentProgress, currentStatus) {
  // Crear modal de edición
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <div class="edit-modal-content">
      <div class="edit-modal-header">
        <h3>Editar Asignación</h3>
        <button class="close-btn" onclick="closeEditModal()">&times;</button>
      </div>
      <div class="edit-modal-body">
        <div class="assignment-info">
          <p><strong>Estudiante:</strong> ${studentName}</p>
          <p><strong>Libro:</strong> ${bookTitle}</p>
        </div>
        <div class="form-group">
          <label for="editProgress">Progreso (%)</label>
          <input type="number" id="editProgress" min="0" max="100" value="${currentProgress}" class="form-input">
        </div>
        <div class="form-group">
          <label for="editStatus">Estado</label>
          <select id="editStatus" class="form-input">
            <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pendiente</option>
            <option value="in_progress" ${currentStatus === 'in_progress' ? 'selected' : ''}>En Progreso</option>
            <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completado</option>
            <option value="overdue" ${currentStatus === 'overdue' ? 'selected' : ''}>Atrasado</option>
          </select>
        </div>
      </div>
      <div class="edit-modal-footer">
        <button class="btn-secondary" onclick="closeEditModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveAssignmentEdit(${assignmentId})">Guardar Cambios</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Agregar estilos CSS inline
  const style = document.createElement('style');
  style.textContent = `
    .edit-modal {
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
    .edit-modal-content {
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .edit-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .edit-modal-header h3 {
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
    .edit-modal-body {
      padding: 1.5rem;
    }
    .assignment-info {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .assignment-info p {
      margin: 0.5rem 0;
      color: #374151;
    }
    .edit-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `;
  document.head.appendChild(style);
}

// Close edit modal function
function closeEditModal() {
  const modal = document.querySelector('.edit-modal');
  if (modal) {
    modal.remove();
  }
}

// Save assignment edit function
async function saveAssignmentEdit(assignmentId) {
  const progressInput = document.getElementById('editProgress');
  const statusSelect = document.getElementById('editStatus');
  
  if (!progressInput || !statusSelect) {
    alert('Error: No se encontraron los campos de edición');
    return;
  }
  
  const progress = parseInt(progressInput.value);
  const status = statusSelect.value;
  
  if (progress < 0 || progress > 100) {
    alert('El progreso debe estar entre 0 y 100');
    return;
  }
  
  try {
    console.log("💾 Guardando cambios de asignación:", { assignmentId, progress, status });
    
    const response = await authFetch(`${API_ROOT}/teacher/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify({
        progress: progress,
        status: status
      })
    });
    
    if (response.success) {
      console.log("✅ Asignación actualizada correctamente");
      alert('Asignación actualizada correctamente');
      closeEditModal();
      // Recargar asignaciones y dashboard
      loadAssignments();
      loadDashboard();
    } else {
      alert(response.message || 'Error al actualizar la asignación');
    }
  } catch (error) {
    console.error("❌ Error actualizando asignación:", error);
    alert('Error al actualizar la asignación: ' + error.message);
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

// ---------------- GLOBAL FUNCTIONS ----------------
window.closeEditModal = closeEditModal;
window.saveAssignmentEdit = saveAssignmentEdit;
