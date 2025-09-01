/**
 * SweetAlert2 Utilities for OpenBook
 * Global utility functions for consistent alert styling across the application
 */

// Wait for SweetAlert2 to be available
function waitForSweetAlert() {
  return new Promise((resolve) => {
    const checkSweetAlert = () => {
      if (typeof Swal !== 'undefined') {
        console.log("✅ SweetAlert2 detected");
        resolve();
      } else {
        console.log("⏳ Waiting for SweetAlert2...");
        setTimeout(checkSweetAlert, 100);
      }
    };
    checkSweetAlert();
  });
}

// Global notification function
function showNotification(message, type = 'info') {
  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 not available, using native alert');
    alert(`${type.toUpperCase()}: ${message}`);
    return;
  }
  
  const icon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
  const title = type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : 'Información';
  
  Swal.fire({
    icon: icon,
    title: title,
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#fff',
    color: '#333',
    customClass: {
      popup: 'swal2-toast',
      title: 'swal2-toast-title',
      content: 'swal2-toast-content'
    }
  });
}

// Success notification
function showSuccess(message) {
  showNotification(message, 'success');
}

// Error notification
function showError(message) {
  showNotification(message, 'error');
}

// Info notification
function showInfo(message) {
  showNotification(message, 'info');
}

// Confirmation dialog
function showConfirm(title, text, confirmText = 'Confirmar', cancelText = 'Cancelar') {
  if (typeof Swal === 'undefined') {
    return confirm(`${title}\n${text}`);
  }
  
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    reverseButtons: true
  });
}

// Loading dialog
function showLoading(title = 'Cargando...') {
  if (typeof Swal === 'undefined') {
    return null;
  }
  
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

// Close loading dialog
function closeLoading() {
  if (typeof Swal !== 'undefined') {
    Swal.close();
  }
}

// Book completion celebration
function showBookCompletion(bookTitle) {
  if (typeof Swal === 'undefined') {
    alert(`¡Felicitaciones! Has completado "${bookTitle}"`);
    return;
  }
  
  Swal.fire({
    title: '🎉 ¡Libro Completado!',
    text: `¡Felicitaciones! Has terminado de leer "${bookTitle}"`,
    icon: 'success',
    confirmButtonText: '¡Genial!',
    confirmButtonColor: '#10b981',
    showClass: {
      popup: 'animate__animated animate__bounceIn'
    },
    hideClass: {
      popup: 'animate__animated animate__bounceOut'
    }
  });
}

// Logout confirmation
function showLogoutConfirm() {
  if (typeof Swal === 'undefined') {
    return confirm('¿Estás seguro de que quieres cerrar sesión?');
  }
  
  return Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro de que quieres salir de OpenBook?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
}

// Logout success
function showLogoutSuccess() {
  if (typeof Swal === 'undefined') {
    alert('Sesión cerrada correctamente');
    return;
  }
  
  Swal.fire({
    title: '¡Hasta luego!',
    text: 'Sesión cerrada correctamente',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });
}

// Reading stats dialog
function showReadingStats(total, completed, inProgress, pending) {
  if (typeof Swal === 'undefined') {
    alert(`Estadísticas de lectura:\nTotal: ${total}\nCompletados: ${completed}\nEn progreso: ${inProgress}\nPendientes: ${pending}`);
    return;
  }
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  Swal.fire({
    title: '📊 Estadísticas de Lectura',
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 8px;">
          <span><strong>Total de libros:</strong></span>
          <span style="color: #3b82f6; font-weight: bold;">${total}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 8px;">
          <span><strong>Completados:</strong></span>
          <span style="color: #10b981; font-weight: bold;">${completed}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #fef3c7; border-radius: 8px;">
          <span><strong>En progreso:</strong></span>
          <span style="color: #f59e0b; font-weight: bold;">${inProgress}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 8px;">
          <span><strong>Pendientes:</strong></span>
          <span style="color: #6b7280; font-weight: bold;">${pending}</span>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${completionRate}%</div>
          <div style="font-size: 0.9rem; opacity: 0.9;">Tasa de completado</div>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: '¡Genial!',
    confirmButtonColor: '#3b82f6',
    showClass: {
      popup: 'animate__animated animate__fadeInUp'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutDown'
    }
  });
}

// Book details dialog
function showBookDetails(title, author, year, coverUrl, status, progress) {
  if (typeof Swal === 'undefined') {
    alert(`Detalles del libro:\nTítulo: ${title}\nAutor: ${author}\nAño: ${year}\nEstado: ${status}\nProgreso: ${progress}%`);
    return;
  }
  
  const statusText = status === 'completed' ? 'COMPLETADO' : status === 'in_progress' ? 'EN PROGRESO' : 'SIN INICIAR';
  const statusColor = status === 'completed' ? '#10b981' : status === 'in_progress' ? '#f59e0b' : '#6b7280';
  
  Swal.fire({
    title: '📖 Detalles del Libro',
    html: `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${coverUrl || '/api/placeholder/200/300'}" alt="${title}" style="width: 120px; height: 180px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 15px;">
        
        <div style="text-align: left; margin: 15px 0;">
          <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
            <strong>Título:</strong> ${title}
          </div>
          <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
            <strong>Autor:</strong> ${author}
          </div>
          <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
            <strong>Año:</strong> ${year}
          </div>
          <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
            <strong>Estado:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
          </div>
          <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px;">
            <strong>Progreso:</strong> ${progress}%
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <div style="background: #f3f4f6; border-radius: 8px; height: 8px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
          </div>
          <div style="margin-top: 8px; font-size: 0.9rem; color: #6b7280;">
            ${progress}% completado
          </div>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#3b82f6',
    showClass: {
      popup: 'animate__animated animate__zoomIn'
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOut'
    }
  });
}

// Export functions for global use
window.SweetAlertUtils = {
  waitForSweetAlert,
  showNotification,
  showSuccess,
  showError,
  showInfo,
  showConfirm,
  showLoading,
  closeLoading,
  showBookCompletion,
  showLogoutConfirm,
  showLogoutSuccess,
  showReadingStats,
  showBookDetails
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 SweetAlert2 Utilities loaded');
});
