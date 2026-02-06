/**
 * Shared Utilities for Public HTML Service Tools
 * Provides theme management, history, URL sharing, and keyboard shortcuts
 */

// ============================================
// Theme Manager
// ============================================
const ThemeManager = {
    STORAGE_KEY: 'phs-theme',

    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.updateToggleButton();
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    updateToggleButton() {
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            const theme = document.documentElement.getAttribute('data-theme') || 'light';
            btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    },

    createToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.type = 'button';
        btn.innerHTML = `
            <span class="icon-sun">☀️</span>
            <span class="icon-moon">🌙</span>
        `;
        btn.addEventListener('click', () => this.toggle());
        return btn;
    }
};

// ============================================
// History Manager
// ============================================
const HistoryManager = {
    MAX_ITEMS: 10,

    getStorageKey(toolName) {
        return `phs-history-${toolName}`;
    },

    getHistory(toolName) {
        const key = this.getStorageKey(toolName);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    addToHistory(toolName, item) {
        const history = this.getHistory(toolName);

        // Create a preview (first 50 chars)
        const preview = typeof item === 'string'
            ? item.substring(0, 50).replace(/\n/g, ' ') + (item.length > 50 ? '...' : '')
            : JSON.stringify(item).substring(0, 50) + '...';

        const entry = {
            value: item,
            preview: preview,
            timestamp: Date.now()
        };

        // Remove duplicates
        const filtered = history.filter(h => h.value !== item);

        // Add new item at the beginning
        filtered.unshift(entry);

        // Keep only MAX_ITEMS
        const trimmed = filtered.slice(0, this.MAX_ITEMS);

        localStorage.setItem(this.getStorageKey(toolName), JSON.stringify(trimmed));
    },

    clearHistory(toolName) {
        localStorage.removeItem(this.getStorageKey(toolName));
    },

    createHistoryDropdown(toolName, onSelect) {
        const container = document.createElement('div');
        container.className = 'history-dropdown';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary btn-icon';
        btn.innerHTML = '📋';
        btn.title = 'History';

        const menu = document.createElement('div');
        menu.className = 'history-menu';

        const updateMenu = () => {
            const history = this.getHistory(toolName);
            if (history.length === 0) {
                menu.innerHTML = '<div class="history-item" style="color: var(--color-text-muted)">No history</div>';
            } else {
                menu.innerHTML = history.map((item, index) =>
                    `<div class="history-item" data-index="${index}">${escapeHtml(item.preview)}</div>`
                ).join('');

                menu.querySelectorAll('.history-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const idx = parseInt(el.dataset.index);
                        if (onSelect && history[idx]) {
                            onSelect(history[idx].value);
                        }
                        menu.classList.remove('show');
                    });
                });
            }
        };

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateMenu();
            menu.classList.toggle('show');
        });

        // Close on outside click
        document.addEventListener('click', () => {
            menu.classList.remove('show');
        });

        container.appendChild(btn);
        container.appendChild(menu);

        return container;
    }
};

// ============================================
// URL Share Manager
// ============================================
const UrlShareManager = {
    encodeData(data) {
        try {
            const json = JSON.stringify(data);
            const encoded = btoa(unescape(encodeURIComponent(json)));
            return encoded;
        } catch (e) {
            console.error('Failed to encode data:', e);
            return null;
        }
    },

    decodeData() {
        try {
            const hash = window.location.hash.substring(1);
            if (!hash) return null;

            const json = decodeURIComponent(escape(atob(hash)));
            return JSON.parse(json);
        } catch (e) {
            console.error('Failed to decode URL data:', e);
            return null;
        }
    },

    updateUrl(data) {
        const encoded = this.encodeData(data);
        if (encoded) {
            const newUrl = window.location.pathname + '#' + encoded;
            window.history.replaceState(null, '', newUrl);
        }
    },

    getShareableUrl(data) {
        const encoded = this.encodeData(data);
        if (encoded) {
            return window.location.origin + window.location.pathname + '#' + encoded;
        }
        return null;
    },

    createShareButton(getDataFn) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary';
        btn.innerHTML = '🔗 Share';
        btn.title = 'Copy shareable URL to clipboard';

        btn.addEventListener('click', async () => {
            const data = getDataFn();
            const url = this.getShareableUrl(data);
            if (url) {
                await copyToClipboard(url);
                showCopyFeedback('Shareable URL copied!');
            }
        });

        return btn;
    }
};

// ============================================
// Keyboard Shortcuts
// ============================================
const KeyboardShortcuts = {
    handlers: {},

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.handlers[key]) {
                e.preventDefault();
                this.handlers[key]();
            }
        });
    },

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    },

    register(combo, handler) {
        this.handlers[combo.toLowerCase()] = handler;
    },

    unregister(combo) {
        delete this.handlers[combo.toLowerCase()];
    }
};

// ============================================
// Clipboard Utilities
// ============================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (e) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function showCopyFeedback(message = 'Copied!') {
    let feedback = document.querySelector('.copy-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        document.body.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.classList.add('show');

    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

// ============================================
// Utility Functions
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
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

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    }).format(date);
}

function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadImage(canvas, filename = 'image.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ============================================
// Tool Initialization Helper
// ============================================
function initTool(options = {}) {
    const {
        toolName = 'tool',
        onExecute,
        onHistorySelect,
        getShareData
    } = options;

    // Initialize theme
    ThemeManager.init();

    // Initialize keyboard shortcuts
    KeyboardShortcuts.init();

    // Register Ctrl+Enter for execute
    if (onExecute) {
        KeyboardShortcuts.register('ctrl+enter', onExecute);
    }

    // Add theme toggle to header
    const header = document.querySelector('.tool-actions');
    if (header) {
        header.prepend(ThemeManager.createToggleButton());

        // Add history dropdown
        if (onHistorySelect) {
            header.appendChild(HistoryManager.createHistoryDropdown(toolName, onHistorySelect));
        }

        // Add share button
        if (getShareData) {
            header.appendChild(UrlShareManager.createShareButton(getShareData));
        }
    }

    // Check for shared data in URL
    const sharedData = UrlShareManager.decodeData();
    if (sharedData) {
        return sharedData;
    }

    return null;
}

// ============================================
// Export for ES modules (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        HistoryManager,
        UrlShareManager,
        KeyboardShortcuts,
        copyToClipboard,
        showCopyFeedback,
        escapeHtml,
        debounce,
        formatBytes,
        formatDate,
        downloadFile,
        downloadImage,
        initTool
    };
}
