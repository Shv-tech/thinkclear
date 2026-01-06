'use client';

import { motion } from 'framer-motion';
import { ANIMATION } from '@/lib/constants';

interface ClarifyButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

// Primary CTA button with sticky mobile positioning
// Loading state animation, disabled handling

export default function ClarifyButton({
    onClick,
    isLoading,
    disabled = false,
}: ClarifyButtonProps) {
    return (
        <>
            {/* Desktop - inline button */}
            <motion.button
                type="button"
                onClick={onClick}
                disabled={isLoading || disabled}
                whileHover={{ scale: isLoading || disabled ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || disabled ? 1 : 0.98 }}
                transition={{ duration: ANIMATION.BUTTON_PRESS / 1000 }}
                className="btn clarify-btn-desktop"
                style={{
                    width: '100%',
                    marginTop: 'var(--space-lg)',
                    padding: 'var(--space-md) var(--space-xl)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 600,
                }}
            >
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>Clarify <span aria-hidden="true">→</span></>
                )}
            </motion.button>

            {/* Mobile - sticky button */}
            <div className="clarify-btn-mobile-container">
                <motion.button
                    type="button"
                    onClick={onClick}
                    disabled={isLoading || disabled}
                    whileTap={{ scale: isLoading || disabled ? 1 : 0.98 }}
                    className="btn clarify-btn-mobile"
                >
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <>Clarify <span aria-hidden="true">→</span></>
                    )}
                </motion.button>
            </div>

            <style jsx global>{`
        .clarify-btn-mobile-container {
          display: none;
        }

        @media (max-width: 639px) {
          .clarify-btn-desktop {
            display: none;
          }

          .clarify-btn-mobile-container {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: var(--space-md);
            padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
            background: linear-gradient(
              to top,
              var(--color-bg) 70%,
              transparent
            );
            z-index: 100;
          }

          .clarify-btn-mobile {
            width: 100%;
            padding: var(--space-md) var(--space-xl);
            font-size: var(--text-lg);
            font-weight: 600;
            box-shadow: var(--shadow-soft);
          }
        }
      `}</style>
        </>
    );
}

function LoadingSpinner() {
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
            }}
            style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
            }}
            aria-label="Processing..."
        />
    );
}
