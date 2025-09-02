/**
 * SweetAlert2 Global Configuration
 * Centralized configuration for SweetAlert2 alerts across the OpenBook application
 * 
 * Features:
 * - Consistent styling across all alerts
 * - Custom themes and animations
 * - Toast notifications
 * - Loading states
 * - Confirmation dialogs
 * 
 * @author OpenBook Development Team
 * @version 1.0.0
 */

// Global SweetAlert2 configuration
const SweetAlertConfig = {
  // Default configuration for all alerts
  defaultConfig: {
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    background: '#fff',
    color: '#333',
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  },

  // Toast notification configuration
  toastConfig: {
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
  },

  // Loading configuration
  loadingConfig: {
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  },

  // Success theme
  successTheme: {
    icon: 'success',
    confirmButtonColor: '#10b981',
    background: '#f0fdf4',
    color: '#065f46'
  },

  // Error theme
  errorTheme: {
    icon: 'error',
    confirmButtonColor: '#ef4444',
    background: '#fef2f2',
    color: '#991b1b'
  },

  // Warning theme
  warningTheme: {
    icon: 'warning',
    confirmButtonColor: '#f59e0b',
    background: '#fffbeb',
    color: '#92400e'
  },

  // Info theme
  infoTheme: {
    icon: 'info',
    confirmButtonColor: '#3b82f6',
    background: '#eff6ff',
    color: '#1e40af'
  },

  // Question theme
  questionTheme: {
    icon: 'question',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    background: '#f8fafc',
    color: '#374151'
  }
};

// Initialize SweetAlert2 with custom configuration
function initializeSweetAlert() {
  if (typeof Swal !== 'undefined') {
    // Set default configuration
    Swal.mixin(SweetAlertConfig.defaultConfig);
    
    console.log('✅ SweetAlert2 configured successfully');
  } else {
    console.warn('⚠️ SweetAlert2 not available');
  }
}

// Export configuration for use in other modules
window.SweetAlertConfig = SweetAlertConfig;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSweetAlert);

// Also initialize when SweetAlert2 loads
if (typeof Swal !== 'undefined') {
  initializeSweetAlert();
} else {
  // Wait for SweetAlert2 to load
  const checkSweetAlert = () => {
    if (typeof Swal !== 'undefined') {
      initializeSweetAlert();
    } else {
      setTimeout(checkSweetAlert, 100);
    }
  };
  checkSweetAlert();
}

