/**
 * Frontend UI Utilities
 * Provides functions for managing loading states, modals, and common UI operations
 */

/**
 * Show loading spinner
 */
function showLoadingSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="flex items-center justify-center py-8">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-slate-700"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400 animate-spin"></div>
        </div>
        <span class="ml-4 text-slate-300">Loading...</span>
      </div>
    `;
  }
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
  const spinners = document.querySelectorAll('[class*="animate-spin"]');
  spinners.forEach(spinner => {
    const parent = spinner.closest('[class*="flex"]');
    if (parent) parent.remove();
  });
}

/**
 * Show error toast notification
 */
function showErrorToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show success toast notification
 */
function showSuccessToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show warning toast notification
 */
function showWarningToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Disable form while processing
 */
function disableForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const inputs = form.querySelectorAll('input, button, select, textarea');
    inputs.forEach(input => {
      input.disabled = true;
      input.style.opacity = '0.6';
    });
  }
}

/**
 * Enable form after processing
 */
function enableForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const inputs = form.querySelectorAll('input, button, select, textarea');
    inputs.forEach(input => {
      input.disabled = false;
      input.style.opacity = '1';
    });
  }
}

/**
 * Validate form inputs
 */
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll('[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      showErrorToast(`${input.name || input.id} is required`);
      input.style.borderColor = '#dc2626';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });

  return isValid;
}

/**
 * Fetch with error handling
 */
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    showErrorToast(error.message || 'An error occurred');
    throw error;
  }
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccessToast('Copied to clipboard!');
  }).catch(() => {
    showErrorToast('Failed to copy to clipboard');
  });
}

/**
 * Format large numbers with commas
 */
function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Format time from milliseconds to readable format
 */
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Show modal dialog
 */
function showModal(title, message, buttons = []) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  
  let buttonsHTML = '';
  buttons.forEach(btn => {
    const btnClass = btn.type === 'primary' 
      ? 'bg-teal-500 hover:bg-teal-400' 
      : 'bg-slate-700 hover:bg-slate-600';
    buttonsHTML += `<button class="px-4 py-2 ${btnClass} rounded text-white" onclick="${btn.onclick}">${btn.label}</button>`;
  });

  modal.innerHTML = `
    <div class="bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-800">
      <h2 class="text-lg font-bold text-white mb-2">${title}</h2>
      <p class="text-slate-300 mb-6">${message}</p>
      <div class="flex gap-2 justify-end">
        ${buttonsHTML}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

/**
 * Close modal dialog
 */
function closeModal(modal) {
  if (modal) modal.remove();
}

/**
 * Add CSS animation styles if not already present
 */
function initializeAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in;
    }
  `;
  document.head.appendChild(style);
}

// Initialize animations on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
  initializeAnimations();
}
