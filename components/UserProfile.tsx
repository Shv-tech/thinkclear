'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION, API } from '@/lib/constants';

interface UserProfileProps {
    onLogout?: () => void;
}

interface UserData {
    authenticated: boolean;
    user: {
        id: string;
        email: string;
        subscriptionStatus: string;
    } | null;
}

// User profile dropdown component
// Shows auth state, subscription status, and actions

export default function UserProfile({ onLogout }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSession();
    }, []);

    const fetchSession = async () => {
        try {
            const response = await fetch(API.AUTH.SESSION);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Failed to fetch session:', error);
            setUserData({ authenticated: false, user: null });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(API.AUTH.LOGOUT, { method: 'POST' });
            setUserData({ authenticated: false, user: null });
            onLogout?.();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--color-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid var(--color-border)',
                        borderTopColor: 'var(--color-accent)',
                        borderRadius: '50%',
                    }}
                />
            </div>
        );
    }

    // Not authenticated - show login button
    if (!userData?.authenticated) {
        return <LoginButton />;
    }

    // Authenticated - show profile
    const initials = userData.user?.email?.slice(0, 2).toUpperCase() || 'U';
    const isSubscribed = userData.user?.subscriptionStatus === 'active';

    return (
        <div style={{ position: 'relative' }}>
            <motion.button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isSubscribed
                        ? 'linear-gradient(135deg, var(--color-accent) 0%, #b8a77a 100%)'
                        : 'var(--color-bg-secondary)',
                    border: '2px solid var(--color-border)',
                    color: isSubscribed ? 'var(--color-bg)' : 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                aria-label="User profile"
            >
                {initials}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 99,
                            }}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: ANIMATION.ENTRY_FADE / 2000 }}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: '240px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--border-radius-lg)',
                                boxShadow: 'var(--shadow-soft)',
                                zIndex: 100,
                                overflow: 'hidden',
                            }}
                        >
                            {/* User info */}
                            <div
                                style={{
                                    padding: 'var(--space-md)',
                                    borderBottom: '1px solid var(--color-border)',
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text)',
                                        fontWeight: 500,
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {userData.user?.email}
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-xs)',
                                        marginTop: 'var(--space-xs)',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: isSubscribed ? '#4ade80' : 'var(--color-text-subtle)',
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        {isSubscribed ? 'Premium' : 'Free Plan'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ padding: 'var(--space-xs)' }}>
                                {!isSubscribed && (
                                    <button
                                        type="button"
                                        onClick={() => {/* Navigate to subscribe */ }}
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-sm) var(--space-md)',
                                            background: 'linear-gradient(135deg, var(--color-accent) 0%, #b8a77a 100%)',
                                            border: 'none',
                                            borderRadius: 'var(--border-radius)',
                                            color: 'var(--color-bg)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            marginBottom: 'var(--space-xs)',
                                        }}
                                    >
                                        Upgrade to Premium
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        color: 'var(--color-text-muted)',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    Sign out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Login button for unauthenticated users
function LoginButton() {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(API.AUTH.MAGIC_LINK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Check your email for the magic link!' });
                setEmail('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send magic link' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <motion.button
                type="button"
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                }}
            >
                Sign in
            </motion.button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 200,
                            padding: 'var(--space-md)',
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--border-radius-lg)',
                                padding: 'var(--space-xl)',
                            }}
                        >
                            <h2 style={{ margin: '0 0 var(--space-md) 0', fontSize: 'var(--text-xl)' }}>
                                Welcome back
                            </h2>
                            <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                                Enter your email to receive a magic sign-in link.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-md)',
                                        marginBottom: 'var(--space-md)',
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn"
                                    style={{ width: '100%' }}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send magic link'}
                                </button>
                            </form>

                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginTop: 'var(--space-md)',
                                        padding: 'var(--space-sm)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: 'var(--text-sm)',
                                        background: message.type === 'success'
                                            ? 'rgba(74, 222, 128, 0.1)'
                                            : 'rgba(248, 113, 113, 0.1)',
                                        color: message.type === 'success' ? '#4ade80' : '#f87171',
                                    }}
                                >
                                    {message.text}
                                </motion.p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
