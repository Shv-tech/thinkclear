// lib/constants.ts
// THINKCLEAR v3 - Central Constants
// Merged with Adaptive Mood logic and International Pricing

export const PRODUCT = {
    name: 'THINKCLEAR',
    version: 'v3',
    tagline: 'Structured cognition for night thinkers',
} as const;

// Psychology-Driven Pricing Strategy
// uses Decoy Effect (Weekly) and Anchoring (Lifetime)
export const PRICING = {
    INR: {
        MONTHLY: 19900,
        WEEKLY: 9900,
        SYMBOL: '₹',
        CURRENCY: 'INR'
    },
    USD: {
        MONTHLY: 999, // $9.99
        WEEKLY: 499,  // $4.99
        SYMBOL: '$',
        CURRENCY: 'USD'
    }
}

// Cognitive Load Index thresholds
export const CLI = {
    LOW_MAX: 1,
    MEDIUM_MAX: 3,
} as const;

// API Routes
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

// Animation durations (ms)
// The adaptive system uses COGNITIVE_SLOW_MULTIPLIER to scale these
export const ANIMATION = {
    ENTRY_FADE: 600,
    SECTION_STAGGER: 150,
    DIVIDER_DRAW: 800,
    THEME_TRANSITION: 400,
    BUTTON_PRESS: 100,
    COGNITIVE_SLOW_MULTIPLIER: 1.5, // Applied when CLI is HIGH
} as const;

// Session & Usage Configuration
export const SESSION = {
    COOKIE_NAME: 'thinkclear_session',
    MAX_AGE_SECONDS: 60 * 60 * 24 * 30, // 30 days
    MAGIC_LINK_EXPIRY_MINUTES: 15,
} as const;

export const USAGE = {
    FREE_DAILY_LIMIT: 3,
    FREE_MONTHLY_LIMIT: 30,
} as const;

// Design tokens
export const COLORS = {
    dark: {
        bg: '#1a1a1a',
        bgSecondary: '#242424',
        text: '#f5f0e6',
        accent: '#d4c5a9',
        border: 'rgba(245, 240, 230, 0.1)',
    }
} as const;

export const OUTPUT_SECTIONS = {
    CORE_ISSUES: 'Core Issues',
    CAN_CONTROL: 'What You Can Control',
    LET_GO: 'What You Can Let Go (For Now)',
    NEXT_STEPS: 'Clear Next Steps',
} as const;