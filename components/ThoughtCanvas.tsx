'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { calculateCLI, CLIResult } from '@/lib/cognitive/cli';

interface ThoughtCanvasProps {
    onSubmit: (text: string, cli: CLIResult) => void;
    isProcessing: boolean;
    disabled?: boolean;
}

// Main input area for thoughts
// Full-width, book-like layout with real-time CLI calculation

export default function ThoughtCanvas({
    onSubmit,
    isProcessing,
    disabled = false,
}: ThoughtCanvasProps) {
    const [text, setText] = useState('');
    const [cli, setCli] = useState<CLIResult | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Calculate CLI as user types (debounced)
    useEffect(() => {
        if (text.length > 10) {
            const timeout = setTimeout(() => {
                setCli(calculateCLI(text));
            }, 300);
            return () => clearTimeout(timeout);
        } else {
            setCli(null);
        }
    }, [text]);

    const handleSubmit = useCallback(() => {
        if (!text.trim() || isProcessing || disabled) return;

        const currentCli = calculateCLI(text);
        onSubmit(text, currentCli);
    }, [text, isProcessing, disabled, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Cmd/Ctrl + Enter to submit
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="section"
        >
            <label htmlFor="thought-input" className="section-title">
                What&apos;s on your mind?
            </label>

            <div style={{ position: 'relative' }}>
                <textarea
                    ref={textareaRef}
                    id="thought-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing || disabled}
                    placeholder="Write freely. No judgment, no memory. Just structure."
                    aria-describedby="thought-meta"
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-lg)',
                        lineHeight: 'var(--leading-relaxed)',
                        resize: 'vertical',
                    }}
                />

                {/* Meta info - word count and CLI indicator */}
                <div
                    id="thought-meta"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'var(--space-sm)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-subtle)',
                    }}
                >
                    <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>

                    {cli && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)',
                            }}
                        >
                            <CLIIndicator level={cli.level} />
                        </motion.span>
                    )}
                </div>
            </div>

            <p
                style={{
                    marginTop: 'var(--space-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-subtle)',
                }}
            >
                Press <kbd style={{
                    padding: '2px 6px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                }}>⌘</kbd> + <kbd style={{
                    padding: '2px 6px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                }}>Enter</kbd> to clarify
            </p>
        </motion.div>
    );
}

// Visual CLI indicator (no label shown to user)
function CLIIndicator({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
    const colors = {
        LOW: 'var(--color-accent)',
        MEDIUM: 'var(--color-text-muted)',
        HIGH: 'var(--color-text-subtle)',
    };

    // Show as abstract dots, not labeled
    return (
        <span
            style={{
                display: 'flex',
                gap: '4px',
            }}
            aria-hidden="true"
        >
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors[level],
                    opacity: level === 'LOW' ? 1 : level === 'MEDIUM' ? 0.6 : 0.3,
                }}
            />
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors[level],
                    opacity: level === 'MEDIUM' || level === 'HIGH' ? 0.6 : 0.3,
                }}
            />
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: colors[level],
                    opacity: level === 'HIGH' ? 1 : 0.3,
                }}
            />
        </span>
    );
}
