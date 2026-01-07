'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsageStats {
    usageCount: number;
    dailyRemaining: number;
    subscriptionStatus?: string;
}

export default function ProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch usage stats when opening
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/api/usage')
                .then((res) => res.json())
                .then((data) => {
                    setStats(data);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-secondary"
                style={{
                    padding: '8px',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                }}
                aria-label="Profile and Settings"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </button>

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
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 50,
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                maxWidth: '450px',
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--border-radius-lg)',
                                padding: 'var(--space-xl)',
                                zIndex: 51,
                                boxShadow: 'var(--shadow-soft)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                                <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Settings</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)' }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Usage Stats Section */}
                            <div className="section" style={{ marginBottom: 'var(--space-lg)' }}>
                                <h3 className="section-title">Usage</h3>
                                {loading ? (
                                    <p className="text-subtle">Loading...</p>
                                ) : stats ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 'var(--space-md)',
                                        background: 'var(--color-bg-secondary)',
                                        padding: 'var(--space-md)',
                                        borderRadius: 'var(--border-radius)'
                                    }}>
                                        <div>
                                            <div className="text-subtle" style={{ fontSize: 'var(--text-xs)' }}>Total Thoughts</div>
                                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{stats.usageCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-subtle" style={{ fontSize: 'var(--text-xs)' }}>Daily Remaining</div>
                                            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>
                                                {stats.dailyRemaining === -1 ? '∞' : stats.dailyRemaining}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-subtle">Could not load stats.</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
                                <button
                                    onClick={closeMenu}
                                    className="btn-secondary"
                                    style={{ padding: 'var(--space-sm) var(--space-md)' }}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
