// LifeSync AI - Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Toggle
    initThemeToggle();

    // Initialize Matrix Background
    initMatrixBackground();

    // Initialize Pricing Toggle
    initPricingToggle();

    // Initialize Smooth Scroll
    initSmoothScroll();

    // Initialize Form Handling
    initFormHandling();

    // Initialize Scroll Animations
    initScrollAnimations();

    // Initialize Stats Counter Animation
    initStatsCounter();

    // Initialize Typewriter Effect
    initTypewriter();
});

// Typewriter Effect
function initTypewriter() {
    const element = document.getElementById('typewriter');
    if (!element) return;

    const phrases = [
        'That Actually Understands You',
        'That Learns Your Patterns',
        'That Helps You Grow',
        'That Never Forgets'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            element.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of phrase
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing after a brief delay
    setTimeout(type, 1000);
}

// Theme Toggle (Dark Mode)
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update navbar style based on theme
            updateNavbarForTheme(newTheme);
        });
    }
}

function updateNavbarForTheme(theme) {
    const navbar = document.querySelector('.navbar');
    if (theme === 'dark') {
        navbar.style.background = 'rgba(15, 15, 26, 0.9)';
    } else {
        navbar.style.background = 'rgba(250, 251, 252, 0.8)';
    }
}

// Matrix Background with floating symbols
function initMatrixBackground() {
    const container = document.getElementById('matrixBg');
    if (!container) return;

    const symbols = [
        '⟨', '⟩', '∴', '∵', '∷', '⊕', '⊗', '⊙', '◉', '○', '●',
        '□', '■', '△', '▽', '◇', '◆', '☆', '★', '⌘', '⌥', '⎔',
        'λ', 'Σ', 'Δ', 'Ω', 'π', 'θ', 'α', 'β', 'γ', 'ψ', 'φ',
        '⟲', '⟳', '↻', '↺', '⤴', '⤵', '↗', '↘', '↙', '↖',
        '{ }', '< >', '[ ]', '( )', '/*', '*/', '//', '##',
        '01', '10', '11', '00', '→', '←', '↑', '↓'
    ];

    const numSymbols = 60;

    for (let i = 0; i < numSymbols; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        char.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        char.style.left = `${Math.random() * 100}%`;
        char.style.top = `${Math.random() * 100}%`;
        char.style.animationDelay = `${Math.random() * 20}s`;
        char.style.animationDuration = `${15 + Math.random() * 15}s`;
        char.style.fontSize = `${10 + Math.random() * 14}px`;
        char.style.opacity = 0.1 + Math.random() * 0.2;
        container.appendChild(char);
    }
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();

    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);

        // Format number with commas
        element.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = formatNumber(target);
        }
    }

    requestAnimationFrame(updateCount);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toLocaleString();
}

// Pricing Toggle
function initPricingToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const plan = btn.dataset.plan;
            updatePricing(plan);
        });
    });
}

function updatePricing(plan) {
    const priceElements = document.querySelectorAll('.pricing-price .amount');

    if (plan === 'teams') {
        priceElements[1].textContent = '39'; // Pro plan
    } else {
        priceElements[1].textContent = '19'; // Individual
    }
}

// Smooth Scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Form Handling
function initFormHandling() {
    const emailForm = document.querySelector('.email-form');

    if (emailForm) {
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailForm.querySelector('.email-input').value;

            if (validateEmail(email)) {
                showNotification('🎉 Welcome to LifeSync! Check your email for next steps.', 'success');
                emailForm.reset();
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }

    // Social buttons
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('🚀 Connecting... (Demo mode)', 'info');
        });
    });

    // CTA buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        if (!btn.closest('.email-form')) {
            btn.addEventListener('click', () => {
                document.querySelector('.hero').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">×</button>
    `;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '16px 24px',
        background: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease',
        fontWeight: '500'
    });

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations
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
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate feature cards, pricing cards, and FAQ items
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .faq-item');

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const matrixBg = document.querySelector('.matrix-bg');

    if (matrixBg) {
        matrixBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (window.scrollY > 50) {
        navbar.style.background = isDark ? 'rgba(15, 15, 26, 0.98)' : 'rgba(250, 251, 252, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.08)';
    } else {
        navbar.style.background = isDark ? 'rgba(15, 15, 26, 0.9)' : 'rgba(250, 251, 252, 0.8)';
        navbar.style.boxShadow = 'none';
    }
});
