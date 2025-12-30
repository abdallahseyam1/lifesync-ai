// LifeSync AI - App JavaScript with Secure AI Integration v2

// AI Configuration (API key stored securely on server)
const AI_CONFIG = {
    apiEndpoint: '/api/chat', // Serverless function handles API key securely
    model: 'google/gemini-2.0-flash-exp:free',
    systemPrompt: `You are LifeSync, a warm, empathetic AI companion focused on personal growth and self-understanding. Your role is to:

1. Listen deeply and validate feelings without judgment
2. Help users understand patterns in their thoughts and behaviors  
3. Gently guide self-reflection without being preachy
4. Remember context from the conversation to provide personalized insights
5. Offer practical, actionable insights when appropriate
6. Use emojis sparingly but warmly (💙 ✨ 🌱 🎯)

Response Guidelines:
- Keep responses concise (2-4 sentences typically) but meaningful
- Ask thoughtful follow-up questions to encourage deeper reflection
- Reference past moods/entries when relevant to show you remember
- Never diagnose or provide medical advice - encourage professional help when needed
- Be encouraging but authentic - avoid toxic positivity

You are speaking with a user who wants to grow and understand themselves better. Be their thoughtful, caring companion on this journey.`
};

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
    currentPage: 'today',
    conversationHistory: [],
    isAiTyping: false
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initNavigation();
    initTheme();
    initMobileMenu();
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

    // Close mobile menu after navigation
    closeMobileMenu();
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mobileHeader = document.getElementById('mobileHeader');

    // Check if mobile
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileHeader.style.display = 'flex';
        } else {
            mobileHeader.style.display = 'none';
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
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

    // Add to conversation history
    AppState.conversationHistory.push({
        role: 'user',
        content: message
    });

    // Generate AI response
    generateAIResponse(message);

    updateDashboard();
}

function addMessage(content, type, isTyping = false) {
    const chatMessages = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    if (isTyping) messageDiv.id = 'typingIndicator';

    messageDiv.innerHTML = `
        <div class="message-avatar">${type === 'ai' ? 'L' : '👤'}</div>
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

function showTypingIndicator() {
    const existing = document.getElementById('typingIndicator');
    if (existing) existing.remove();
    addMessage('<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>', 'ai', true);
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function generateAIResponse(userMessage) {
    // Show typing indicator
    showTypingIndicator();
    AppState.isAiTyping = true;

    try {
        // Build context with user data
        const userContext = buildUserContext();

        const messages = [
            {
                role: 'system',
                content: AI_CONFIG.systemPrompt + '\n\n' + userContext
            },
            ...AppState.conversationHistory.slice(-10) // Keep last 10 messages for context
        ];

        console.log('Calling secure AI API...'); // Debug log

        // Call our serverless function (API key is stored securely on server)
        const response = await fetch(AI_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: messages,
                max_tokens: 500,
                temperature: 0.8
            })
        });

        removeTypingIndicator();

        console.log('API Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Body:', errorBody);
            throw new Error(`API error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log('API Response data:', data); // Debug log

        const aiMessage = data.choices?.[0]?.message?.content;

        if (!aiMessage) {
            throw new Error('No response content from AI');
        }

        addMessage(aiMessage, 'ai');
        AppState.conversationHistory.push({ role: 'assistant', content: aiMessage });

    } catch (error) {
        console.error('AI Error:', error);
        removeTypingIndicator();

        // Show error to user for debugging
        if (error.message.includes('401') || error.message.includes('API key')) {
            addMessage("⚠️ AI service configuration issue. Using smart fallback.", 'ai');
        } else if (error.message.includes('429')) {
            addMessage("⚠️ AI is busy. Please wait a moment and try again.", 'ai');
        } else {
            // Use local fallback if API fails
            const response = getFallbackResponse(userMessage);
            addMessage(response, 'ai');
            AppState.conversationHistory.push({ role: 'assistant', content: response });
        }
    }

    AppState.isAiTyping = false;
}

function buildUserContext() {
    const recentMoods = AppState.user.moods.slice(-7);
    const recentEntries = AppState.user.entries.slice(-5);

    let context = 'USER CONTEXT:\n';

    if (AppState.user.name) {
        context += `- User's name: ${AppState.user.name}\n`;
    }

    if (recentMoods.length > 0) {
        const moodSummary = recentMoods.map(m => m.value).join(', ');
        context += `- Recent moods (last ${recentMoods.length} entries): ${moodSummary}\n`;

        const moodValues = { great: 5, good: 4, okay: 3, low: 2, stressed: 1 };
        const avg = recentMoods.reduce((s, m) => s + (moodValues[m.value] || 3), 0) / recentMoods.length;
        context += `- Average mood score: ${avg.toFixed(1)}/5\n`;
    }

    if (recentEntries.length > 0) {
        context += `- Total journal entries: ${AppState.user.entries.length}\n`;
        context += `- Recent topics discussed: ${recentEntries.map(e => e.content?.substring(0, 50) + '...').join('; ')}\n`;
    }

    return context;
}

function getFallbackResponse(userMessage) {
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

    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
        return "I'm sorry you're feeling this way. 💙 It takes courage to acknowledge these feelings. Would you like to talk about what's weighing on you? I'm here to listen, not judge.";
    }

    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
        return "Feeling overwhelmed is a sign you might be carrying too much right now. 🌱 What's one thing on your plate that feels most pressing? Sometimes we just need to start small.";
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

    // Profile name
    if (displayName) {
        displayName.value = AppState.user.name || '';
        displayName.addEventListener('change', () => {
            AppState.user.name = displayName.value;
            saveState();
            updateGreeting();
            showNotification('Name saved! 👋', 'success');
        });
    }

    // Export data
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

    // Clear data
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
