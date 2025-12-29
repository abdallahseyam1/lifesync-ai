// LifeSync AI - App JavaScript

// App State
const AppState = {
    user: {
        name: '',
        entries: [],
        moods: [],
        patterns: [],
        decisions: [],
        settings: {
            theme: 'light'
        }
    },
    currentPage: 'today'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initNavigation();
    initTheme();
    initMoodSelector();
    initChat();
    initQuickCapture();
    initSettings();
    updateGreeting();
    updateDashboard();
});

// State Management
function loadState() {
    const saved = localStorage.getItem('lifesync_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(AppState.user, parsed);
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }
}

function saveState() {
    localStorage.setItem('lifesync_state', JSON.stringify(AppState.user));
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
}

function navigateTo(pageName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === `page-${pageName}`);
    });

    AppState.currentPage = pageName;
}

// Theme
function initTheme() {
    const themeToggle = document.getElementById('appThemeToggle');
    const themeSelect = document.getElementById('themeSelect');

    // Apply saved theme
    applyTheme(AppState.user.settings.theme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            AppState.user.settings.theme = newTheme;
            saveState();
        });
    }

    if (themeSelect) {
        themeSelect.value = AppState.user.settings.theme;
        themeSelect.addEventListener('change', () => {
            applyTheme(themeSelect.value);
            AppState.user.settings.theme = themeSelect.value;
            saveState();
        });
    }
}

function applyTheme(theme) {
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);

    const themeIcon = document.querySelector('.theme-toggle-app .theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Mood Selector
function initMoodSelector() {
    const moodBtns = document.querySelectorAll('.mood-btn');

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove previous selection
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Save mood
            const mood = btn.dataset.mood;
            const entry = {
                type: 'mood',
                value: mood,
                timestamp: new Date().toISOString()
            };

            AppState.user.moods.push(entry);
            saveState();

            // Show confirmation
            showNotification(`Mood recorded: ${getMoodEmoji(mood)} ${mood}`, 'success');

            // Update dashboard
            updateDashboard();
        });
    });
}

function getMoodEmoji(mood) {
    const emojis = {
        great: '😊',
        good: '🙂',
        okay: '😐',
        low: '😔',
        stressed: '😰'
    };
    return emojis[mood] || '😐';
}

// Chat
function initChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (!chatInput || !sendBtn) return;

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
    });

    // Send on Enter (but not Shift+Enter)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Save entry
    const entry = {
        type: 'message',
        content: message,
        timestamp: new Date().toISOString()
    };
    AppState.user.entries.push(entry);
    saveState();

    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addMessage(response, 'ai');
    }, 1000 + Math.random() * 1000);

    updateDashboard();
}

function addMessage(content, type) {
    const chatMessages = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    messageDiv.innerHTML = `
        <div class="message-avatar">${type === 'ai' ? 'L' : '👤'}</div>
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Pattern-based responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
        return "I hear you're feeling anxious. That's completely valid. 💙 Would you like to explore what's triggering these feelings? Sometimes writing it out helps us see things more clearly.";
    }

    if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('excited')) {
        return "That's wonderful! 🎉 I love hearing about the good moments. What's contributing to this positive feeling? I'll remember this so we can identify patterns in what brings you joy.";
    }

    if (lowerMessage.includes('decision') || lowerMessage.includes('decide') || lowerMessage.includes('choose')) {
        return "Making decisions can be challenging. Let's break this down together. 🤔 What are your options, and what matters most to you in this choice? I'll save this so we can review the outcome later.";
    }

    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('sleep')) {
        return "Rest is so important for mental clarity. 😴 Have you noticed any patterns in what affects your energy levels? I can help track this over time.";
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('want to') || lowerMessage.includes('wish')) {
        return "Setting intentions is powerful! ✨ I've noted this as something important to you. What's one small step you could take toward this today?";
    }

    // Default responses
    const defaults = [
        "Thank you for sharing that with me. 💭 I'm here to listen and help you understand your patterns over time. Tell me more about how this makes you feel.",
        "I appreciate you opening up. 🌱 Every thought you share helps me understand you better. What else is on your mind?",
        "That's really insightful. 💡 I'm noting this as part of your journey. How does reflecting on this make you feel?",
        "I'm listening. 🎯 Your thoughts and feelings matter. Is there anything specific you'd like to explore about this?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Quick Capture
function initQuickCapture() {
    const quickCaptureBtn = document.getElementById('quickCapture');
    const modal = document.getElementById('quickCaptureModal');
    const closeModal = document.getElementById('closeModal');
    const saveCapture = document.getElementById('saveCapture');
    const captureInput = document.getElementById('quickCaptureInput');

    if (!quickCaptureBtn || !modal) return;

    quickCaptureBtn.addEventListener('click', () => {
        modal.classList.add('active');
        captureInput.focus();
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        captureInput.value = '';
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            captureInput.value = '';
        }
    });

    saveCapture.addEventListener('click', () => {
        const content = captureInput.value.trim();
        if (content) {
            const entry = {
                type: 'quick_capture',
                content: content,
                timestamp: new Date().toISOString()
            };
            AppState.user.entries.push(entry);
            saveState();

            showNotification('Thought captured! 📝', 'success');
            modal.classList.remove('active');
            captureInput.value = '';
            updateDashboard();
        }
    });
}

// Settings
function initSettings() {
    const displayName = document.getElementById('displayName');
    const exportBtn = document.getElementById('exportData');
    const clearBtn = document.getElementById('clearData');

    if (displayName) {
        displayName.value = AppState.user.name || '';
        displayName.addEventListener('change', () => {
            AppState.user.name = displayName.value;
            saveState();
            updateGreeting();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = JSON.stringify(AppState.user, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lifesync-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            showNotification('Data exported! 📥', 'success');
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.removeItem('lifesync_state');
                location.reload();
            }
        });
    }
}

// Update Functions
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.querySelector('.page-header h1');
    const subtitleEl = document.getElementById('greetingSubtitle');

    let greeting = 'Hello';
    let subtitle = "Let's make today count.";

    if (hour < 12) {
        greeting = 'Good morning';
        subtitle = "What's on your mind today?";
    } else if (hour < 17) {
        greeting = 'Good afternoon';
        subtitle = 'How is your day going?';
    } else {
        greeting = 'Good evening';
        subtitle = 'Time to reflect on your day.';
    }

    const name = AppState.user.name ? `, ${AppState.user.name}` : '';

    if (greetingEl) {
        greetingEl.textContent = `${greeting}${name}! ${hour < 17 ? '☀️' : '🌙'}`;
    }

    if (subtitleEl) {
        subtitleEl.textContent = subtitle;
    }
}

function updateDashboard() {
    // Update entries count
    const entriesCount = document.getElementById('entriesCount');
    if (entriesCount) {
        entriesCount.textContent = AppState.user.entries.length;
    }

    // Update mood score
    const moodScore = document.getElementById('moodScore');
    if (moodScore && AppState.user.moods.length > 0) {
        const moodValues = { great: 5, good: 4, okay: 3, low: 2, stressed: 1 };
        const recentMoods = AppState.user.moods.slice(-7);
        const avg = recentMoods.reduce((sum, m) => sum + (moodValues[m.value] || 3), 0) / recentMoods.length;
        moodScore.textContent = avg.toFixed(1);
    }

    // Update patterns count (placeholder)
    const patternsCount = document.getElementById('patternsCount');
    if (patternsCount) {
        patternsCount.textContent = Math.min(Math.floor(AppState.user.entries.length / 5), 10);
    }

    // Update recent entries
    updateRecentEntries();

    // Update growth score
    const growthScore = document.getElementById('growthScore');
    if (growthScore) {
        const score = Math.min(10 + AppState.user.entries.length * 2 + AppState.user.moods.length, 100);
        growthScore.textContent = score;
    }
}

function updateRecentEntries() {
    const container = document.getElementById('recentEntries');
    if (!container) return;

    const entries = AppState.user.entries.slice(-5).reverse();

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>📝</span>
                <p>No entries yet. Start a conversation with LifeSync!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="entry-item">
            <span class="entry-type">${entry.type === 'mood' ? '😊' : '💭'}</span>
            <div class="entry-content">
                <p>${entry.content || entry.value || 'Entry'}</p>
                <span class="entry-time">${formatTime(entry.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

// Notifications
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.app-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.innerHTML = `<span>${message}</span>`;

    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#4F46E5'
    };

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '16px 24px',
        background: colors[type] || colors.info,
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease',
        fontWeight: '500'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .entry-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        background: var(--bg);
        margin-bottom: 8px;
    }
    .entry-type {
        font-size: 1.25rem;
    }
    .entry-content p {
        margin: 0;
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }
    .entry-time {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
`;
document.head.appendChild(style);
