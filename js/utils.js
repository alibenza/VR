// Utility Functions
const utils = {
    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    },

    // Format datetime
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>' :
            type === 'error' ?
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Show loading overlay
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    // Resize and compress image
    async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    // Convert blob to base64
    async blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Escape CSV cell
    escapeCSV(str) {
        if (str === null || str === undefined) return '';
        str = str.toString();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    },

    // Download file
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    },

    // Create modal
    createModal(title, content, buttons = []) {
        const container = document.getElementById('modalContainer');
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const buttonsHTML = buttons.map(btn => 
            `<button class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action}">${btn.label}</button>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="icon-btn" data-action="close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `<div class="modal-footer">${buttonsHTML}</div>` : ''}
            </div>
        `;
        
        container.appendChild(modal);
        return modal;
    },

    // Close all modals
    closeModals() {
        const container = document.getElementById('modalContainer');
        container.innerHTML = '';
    },

    // Confirm dialog
    async confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const modal = this.createModal(
                title,
                `<p>${message}</p>`,
                [
                    { label: 'Annuler', class: 'btn-outline', action: 'cancel' },
                    { label: 'Confirmer', class: 'btn-primary', action: 'confirm' }
                ]
            );
            
            modal.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    modal.remove();
                } else if (action === 'cancel' || action === 'close') {
                    resolve(false);
                    modal.remove();
                }
            });
        });
    }
};
