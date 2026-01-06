// THINKCLEAR v3 - Central Constants
// All configuration values in one place

export const PRODUCT = {
    name: 'THINKCLEAR',
    version: 'v3',
    tagline: 'Structured cognition for night thinkers',
} as const;

// Pricing (INR)
export const PRICING = {
    MONTHLY_SUBSCRIPTION: 19900, // ₹199 in paise
    MONTHLY_DISPLAY: '₹199',
    SEVEN_DAY_PASS: 9900, // ₹99 in paise
    SEVEN_DAY_DISPLAY: '₹99',
    CURRENCY: 'INR',
} as const;

// Cognitive Load Index thresholds
export const CLI = {
    LOW_MAX: 1,
    MEDIUM_MAX: 3,
    // Above MEDIUM_MAX = HIGH
} as const;

// Animation durations (ms) - slower for calm
export const ANIMATION = {
    ENTRY_FADE: 600,
    SECTION_STAGGER: 150,
    DIVIDER_DRAW: 800,
    THEME_TRANSITION: 400,
    BUTTON_PRESS: 100,
    COGNITIVE_SLOW_MULTIPLIER: 1.5, // Applied when CLI is HIGH
} as const;

// API routes
export const API = {
    CLARIFY: '/api/clarify',
    AUTH: {
        MAGIC_LINK: '/api/auth/magic-link',
        VERIFY: '/api/auth/verify',
        SESSION: '/api/auth/session',
        LOGOUT: '/api/auth/logout',
    },
    PAYMENTS: {
        CREATE_SUBSCRIPTION: '/api/payments/create-subscription',
        CREATE_PASS: '/api/payments/create-pass',
        WEBHOOK: '/api/payments/webhook',
        STATUS: '/api/payments/status',
    },
    USAGE: '/api/usage',
} as const;

// Session configuration
export const SESSION = {
    COOKIE_NAME: 'thinkclear_session',
    MAX_AGE_SECONDS: 60 * 60 * 24 * 30, // 30 days
    MAGIC_LINK_EXPIRY_MINUTES: 15,
} as const;

// Usage limits for free tier
export const USAGE = {
    FREE_DAILY_LIMIT: 3,
    FREE_MONTHLY_LIMIT: 30,
} as const;

// Design tokens (matching CSS variables)
export const COLORS = {
    // Dark theme (default)
    dark: {
        bg: '#1a1a1a',
        bgSecondary: '#242424',
        text: '#f5f0e6', // Cream
        textMuted: 'rgba(245, 240, 230, 0.6)',
        accent: '#d4c5a9',
        border: 'rgba(245, 240, 230, 0.1)',
    },
    // Light theme
    light: {
        bg: '#f5f0e6',
        bgSecondary: '#ebe5d8',
        text: '#1a1a1a',
        textMuted: 'rgba(26, 26, 26, 0.6)',
        accent: '#6b5b3d',
        border: 'rgba(26, 26, 26, 0.1)',
    },
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
} as const;

// Cognitive output section labels
export const OUTPUT_SECTIONS = {
    CORE_ISSUES: 'Core Issues',
    CAN_CONTROL: 'What You Can Control',
    LET_GO: 'What You Can Let Go (For Now)',
    NEXT_STEPS: 'Clear Next Steps',
} as const;
