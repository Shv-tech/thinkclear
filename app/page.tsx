'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThoughtCanvas from '@/components/ThoughtCanvas';
import OutputSection from '@/components/OutputSection';
import ClarifyButton from '@/components/ClarifyButton';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfile from '@/components/UserProfile';
import { CognitiveOutput, CLIResult, getCLIDurationMultiplier } from '@/lib/cognitive';
import { API, PRODUCT, ANIMATION } from '@/lib/constants';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<CognitiveOutput | null>(null);
  const [currentCli, setCurrentCli] = useState<CLIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const handleSubmit = useCallback(async (text: string, cli: CLIResult) => {
    setIsProcessing(true);
    setError(null);
    setCurrentCli(cli);
    setInputText(text);

    try {
      const response = await fetch(API.CLARIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to process thoughts');
      }

      const result: CognitiveOutput = await response.json();
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setOutput(null);
    setError(null);
    setCurrentCli(null);
    setInputText('');
  };

  const animationMultiplier = currentCli
    ? getCLIDurationMultiplier(currentCli.level)
    : 1;

  return (
    <main className="book-layout">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION.ENTRY_FADE / 1000 }}
        className="header"
      >
        <div className="header-brand">
          <motion.h1
            className="header-title"
            whileHover={{ opacity: 0.8 }}
          >
            {PRODUCT.name}
          </motion.h1>
          <p className="header-tagline">
            {PRODUCT.tagline}
          </p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <UserProfile />
        </div>
      </motion.header>

      {/* Hero section for empty state */}
      <AnimatePresence mode="wait">
        {!output && !isProcessing && !inputText && (
          <motion.section
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-section"
          >
            <h2 className="hero-title">
              Untangle your thoughts.<br />
              <span className="text-accent">Find clarity.</span>
            </h2>
            <p className="hero-description text-muted">
              Write what's on your mind. No judgment, no memory, no chat.<br />
              Just structured thinking for when your mind feels full.
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="container main-content">
        <AnimatePresence mode="wait">
          {!output ? (
            <motion.div
              key="input"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ThoughtCanvas
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
              />

              <ClarifyButton
                onClick={() => {
                  const event = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    metaKey: true,
                    bubbles: true,
                  });
                  document.getElementById('thought-input')?.dispatchEvent(event);
                }}
                isLoading={isProcessing}
                disabled={false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OutputSection
                output={output}
                animationMultiplier={animationMultiplier}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="reset-section"
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  Start fresh
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: ANIMATION.ENTRY_FADE / 1000 }}
        className="footer"
      >
        <p className="text-subtle">
          No chat history. No emotional memory. Just structure.
        </p>
      </motion.footer>

      <style jsx global>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
          position: relative;
          z-index: 10;
        }

        .header-brand {
          flex: 1;
        }

        .header-title {
          font-size: var(--text-xl);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0;
          background: linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-tagline {
          font-size: var(--text-sm);
          color: var(--color-text-subtle);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .hero-section {
          text-align: center;
          max-width: 600px;
          margin: 0 auto var(--space-3xl) auto;
          padding: 0 var(--space-md);
        }

        .hero-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin: 0 0 var(--space-lg) 0;
        }

        .hero-description {
          font-size: var(--text-lg);
          line-height: 1.6;
          margin: 0;
        }

        .main-content {
          position: relative;
          z-index: 10;
          flex: 1;
        }

        .reset-section {
          text-align: center;
          margin-top: var(--space-2xl);
        }

        .error-message {
          margin-top: var(--space-xl);
          padding: var(--space-md);
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: var(--border-radius);
          color: #fca5a5;
          text-align: center;
        }

        .footer {
          margin-top: auto;
          padding-top: var(--space-3xl);
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .footer p {
          font-size: var(--text-xs);
          margin: 0;
        }

        /* Responsive enhancements */
        @media (max-width: 639px) {
          .header {
            flex-wrap: wrap;
          }

          .header-brand {
            flex: 1 1 100%;
            margin-bottom: var(--space-sm);
          }

          .header-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .hero-section {
            margin-bottom: var(--space-2xl);
          }

          .hero-title {
            font-size: 1.5rem;
          }

          .hero-description {
            font-size: var(--text-base);
          }

          .hero-description br {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .hero-section {
            margin-bottom: var(--space-3xl);
            padding-top: var(--space-xl);
          }

          .hero-title {
            font-size: 2.75rem;
          }
        }
      `}</style>
    </main>
  );
}
