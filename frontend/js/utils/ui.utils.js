// ============================================================================
// UI UTILITIES - Common UI functions and helpers
// ============================================================================

/**
 * Show loading state
 * @param {string} message - Loading message
 * @param {HTMLElement} element - Element to show loading in
 */
export function showLoading(message = 'Cargando...', element = null) {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading-text">${message}</p>
        </div>
    `;
    
    if (element) {
        element.innerHTML = loadingHTML;
    } else {
        // Show global loading
        let globalLoading = document.getElementById('global-loading');
        if (!globalLoading) {
            globalLoading = document.createElement('div');
            globalLoading.id = 'global-loading';
            globalLoading.className = 'global-loading-overlay';
            globalLoading.innerHTML = loadingHTML;
            document.body.appendChild(globalLoading);
        }
        globalLoading.style.display = 'flex';
    }
}

/**
 * Hide loading state
 * @param {HTMLElement} element - Element to hide loading from
 */
export function hideLoading(element = null) {
    if (element) {
        const loadingContainer = element.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    } else {
        // Hide global loading
        const globalLoading = document.getElementById('global-loading');
        if (globalLoading) {
            globalLoading.style.display = 'none';
        }
    }
}

/**
 * Show success message
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export function showError(message, duration = 5000) {
    showNotification(message, 'error', duration);
}

/**
 * Show info message
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration = 3000) {
    showNotification(message, 'info', duration);
}

/**
 * Show notification
 * @param {string} message - Message to show
 * @param {string} type - Notification type (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            }
            
            .notification-success {
                background-color: #10b981;
            }
            
            .notification-error {
                background-color: #ef4444;
            }
            
            .notification-info {
                background-color: #3b82f6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
                padding: 0;
                line-height: 1;
            }
            
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
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Create book card element
 * @param {Object} book - Book data
 * @param {boolean} showActions - Whether to show action buttons
 * @returns {HTMLElement} Book card element
 */
export function createBookCard(book, showActions = true) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.id;
    
    const coverUrl = book.cover_url || '/assets/images/default-cover.jpg';
    
    card.innerHTML = `
        <div class="book-cover">
            <img src="${coverUrl}" alt="${book.title}" onerror="this.src='/assets/images/default-cover.jpg'">
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <p class="book-genre">${book.genre}</p>
            ${book.description ? `<p class="book-description">${book.description.substring(0, 100)}...</p>` : ''}
        </div>
        ${showActions ? `
            <div class="book-actions">
                <button class="btn btn-primary btn-sm" onclick="viewBook(${book.id})">
                    Ver Detalles
                </button>
                <button class="btn btn-outline btn-sm favorite-btn" onclick="toggleFavorite(${book.id})" data-book-id="${book.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        ` : ''}
    `;
    
    return card;
}

/**
 * Create student card element
 * @param {Object} student - Student data
 * @returns {HTMLElement} Student card element
 */
export function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.dataset.studentId = student.id;
    
    const lastLogin = student.last_login ? new Date(student.last_login).toLocaleDateString() : 'Nunca';
    
    card.innerHTML = `
        <div class="student-avatar">
            <i class="fas fa-user-graduate"></i>
        </div>
        <div class="student-info">
            <h3 class="student-name">${student.full_name}</h3>
            <p class="student-email">${student.email}</p>
            <p class="student-stats">
                <span class="stat">
                    <i class="fas fa-book"></i> ${student.books_read || 0} libros
                </span>
                <span class="stat">
                    <i class="fas fa-heart"></i> ${student.favorites_count || 0} favoritos
                </span>
            </p>
            <p class="student-joined">Se unió: ${new Date(student.created_at).toLocaleDateString()}</p>
            <p class="student-last-login">Último acceso: ${lastLogin}</p>
        </div>
        <div class="student-actions">
            <button class="btn btn-primary btn-sm" onclick="viewStudent(${student.id})">
                Ver Perfil
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Create pagination controls
 * @param {Object} pagination - Pagination data
 * @param {Function} onPageChange - Callback for page changes
 * @returns {HTMLElement} Pagination element
 */
export function createPagination(pagination, onPageChange) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    const { page, pages, total } = pagination;
    
    if (pages <= 1) return paginationContainer;
    
    let paginationHTML = `
        <div class="pagination-info">
            Mostrando página ${page} de ${pages} (${total} total)
        </div>
        <div class="pagination-controls">
    `;
    
    // Previous button
    if (page > 1) {
        paginationHTML += `<button class="btn btn-outline btn-sm" onclick="changePage(${page - 1})">Anterior</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === page ? 'active' : '';
        paginationHTML += `<button class="btn btn-outline btn-sm ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Next button
    if (page < pages) {
        paginationHTML += `<button class="btn btn-outline btn-sm" onclick="changePage(${page + 1})">Siguiente</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
    
    // Add global functions for pagination
    window.changePage = onPageChange;
    
    return paginationContainer;
}

/**
 * Create search and filter form
 * @param {Object} filters - Current filters
 * @param {Function} onFilterChange - Callback for filter changes
 * @param {Array} genres - Available genres
 * @returns {HTMLElement} Filter form element
 */
export function createFilterForm(filters = {}, onFilterChange, genres = []) {
    const form = document.createElement('div');
    form.className = 'filter-form';
    
    form.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <input type="text" 
                       class="form-control" 
                       placeholder="Buscar libros..." 
                       value="${filters.search || ''}"
                       onkeyup="debounceSearch(this.value)">
            </div>
            <div class="filter-group">
                <select class="form-control" onchange="filterByGenre(this.value)">
                    <option value="">Todos los géneros</option>
                    ${genres.map(genre => `
                        <option value="${genre}" ${filters.genre === genre ? 'selected' : ''}>
                            ${genre}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="filter-group">
                <select class="form-control" onchange="filterBySort(this.value)">
                    <option value="title" ${filters.sort === 'title' ? 'selected' : ''}>Ordenar por título</option>
                    <option value="author" ${filters.sort === 'author' ? 'selected' : ''}>Ordenar por autor</option>
                    <option value="genre" ${filters.sort === 'genre' ? 'selected' : ''}>Ordenar por género</option>
                    <option value="created_at" ${filters.sort === 'created_at' ? 'selected' : ''}>Más recientes</option>
                </select>
            </div>
        </div>
    `;
    
    // Add global functions for filtering
    let searchTimeout;
    window.debounceSearch = (value) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onFilterChange({ ...filters, search: value, page: 1 });
        }, 300);
    };
    
    window.filterByGenre = (genre) => {
        onFilterChange({ ...filters, genre: genre || undefined, page: 1 });
    };
    
    window.filterBySort = (sort) => {
        onFilterChange({ ...filters, sort, page: 1 });
    };
    
    return form;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    if (!date) return 'N/A';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return formatDate(date);
}
