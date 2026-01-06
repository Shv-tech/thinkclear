'use client';

import { motion } from 'framer-motion';
import { PRICING, ANIMATION } from '@/lib/constants';

interface SubscriptionGateProps {
    isSubscribed: boolean;
    onSubscribe: (plan: 'monthly' | 'weekly') => void;
    children: React.ReactNode;
    usageRemaining?: number;
}

// Paywall component that gates premium features
// Shows pricing options for non-subscribers

export default function SubscriptionGate({
    isSubscribed,
    onSubscribe,
    children,
    usageRemaining,
}: SubscriptionGateProps) {
    // If subscribed, render children directly
    if (isSubscribed) {
        return <>{children}</>;
    }

    // If free usage remaining, show children with limit notice
    if (usageRemaining !== undefined && usageRemaining > 0) {
        return (
            <>
                {children}
                <FreeUsageNotice remaining={usageRemaining} onSubscribe={onSubscribe} />
            </>
        );
    }

    // Show subscription gate
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION.ENTRY_FADE / 1000 }}
            className="card"
            style={{
                textAlign: 'center',
                maxWidth: '500px',
                margin: 'var(--space-2xl) auto',
            }}
        >
            <h2 style={{ marginBottom: 'var(--space-md)' }}>
                Continue Clarifying
            </h2>

            <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
                You&apos;ve used your free clarifications. Subscribe to continue organizing your thoughts.
            </p>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)',
                }}
            >
                {/* Monthly subscription */}
                <motion.button
                    type="button"
                    onClick={() => onSubscribe('monthly')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: 'var(--space-lg)',
                    }}
                >
                    <span style={{ display: 'block' }}>
                        <strong>{PRICING.MONTHLY_DISPLAY}/month</strong>
                    </span>
                    <span
                        style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            opacity: 0.8,
                            marginTop: 'var(--space-xs)',
                        }}
                    >
                        Unlimited clarifications
                    </span>
                </motion.button>

                {/* 7-day pass */}
                <motion.button
                    type="button"
                    onClick={() => onSubscribe('weekly')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-secondary"
                    style={{
                        width: '100%',
                        padding: 'var(--space-lg)',
                    }}
                >
                    <span style={{ display: 'block' }}>
                        <strong>{PRICING.SEVEN_DAY_DISPLAY}</strong>
                    </span>
                    <span
                        style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            opacity: 0.8,
                            marginTop: 'var(--space-xs)',
                        }}
                    >
                        7-day pass
                    </span>
                </motion.button>
            </div>

            <p
                className="text-subtle"
                style={{
                    fontSize: 'var(--text-xs)',
                    marginTop: 'var(--space-lg)',
                }}
            >
                Secure payment via Razorpay. Cancel anytime.
            </p>
        </motion.div>
    );
}

// Notice shown when user still has free usage
function FreeUsageNotice({
    remaining,
    onSubscribe,
}: {
    remaining: number;
    onSubscribe: (plan: 'monthly' | 'weekly') => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: ANIMATION.ENTRY_FADE / 1000 }}
            style={{
                position: 'fixed',
                bottom: 'var(--space-xl)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--space-sm) var(--space-lg)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                zIndex: 50,
                boxShadow: 'var(--shadow-soft)',
            }}
        >
            <span className="text-muted">
                {remaining} free {remaining === 1 ? 'clarification' : 'clarifications'} left today
            </span>
            <button
                type="button"
                onClick={() => onSubscribe('monthly')}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    padding: 0,
                }}
            >
                Upgrade
            </button>
        </motion.div>
    );
}
