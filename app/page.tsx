'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import ThoughtCanvas from '@/components/ThoughtCanvas';
import OutputSection from '@/components/OutputSection';
import SignInModal from '@/components/SignInModal';
import { CLIResult } from '@/lib/cognitive';

type TrialState = {
  remaining: number; // 3 = 1 real + 2 generic
  realUsed: boolean;
};

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [trial, setTrial] = useState<TrialState>({
    remaining: 3,
    realUsed: false,
  });

  const abortRef = useRef<AbortController | null>(null);

  /* ---------------- SAFE SESSION INIT ---------------- */
  useEffect(() => {
    let mounted = true;

    fetch('/api/auth/session')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!mounted || !data) return;

        const remaining =
          typeof data.trialLeft === 'number'
            ? data.trialLeft
            : 3;

        setTrial({
          remaining: Math.max(0, Math.min(3, remaining)),
          realUsed: remaining < 3,
        });
      })
      .catch(() => {
        // Fail CLOSED — never break thinking
        setTrial({ remaining: 3, realUsed: false });
      });

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  /* ---------------- SAFE SUBMIT HANDLER ---------------- */
  const handleSubmit = useCallback(
    async (text: string, cli: CLIResult) => {
      if (!text.trim() || isProcessing) return;

      if (trial.remaining <= 0) {
        document.getElementById('pricing')?.scrollIntoView({
          behavior: 'smooth',
        });
        return;
      }

      setIsProcessing(true);
      abortRef.current = new AbortController();

      try {
        const endpoint =
          !trial.realUsed
            ? '/api/clarify'            // 1 REAL call
            : '/api/clarify/generic';   // 2 SAFE calls

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, cli }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error('Request failed');
        }

        const result = await res.json();

        setOutput(result);
        setTrial(prev => ({
          remaining: Math.max(0, prev.remaining - 1),
          realUsed: true,
        }));
      } catch {
        // HARD FAILSAFE OUTPUT
        setOutput({
          clarityScore: '—',
          summary: 'Pause. Breathe. Clarify one thing at a time.',
          bullets: [
            'What is actually bothering you?',
            'What is in your control today?',
            'What can wait until tomorrow?',
          ],
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [trial, isProcessing]
  );

  return (
    <>
      <Header onSignIn={() => setShowSignIn(true)} />

      <main className="page">

        {/* ================= THINK ================= */}
        <section id="think" className="section think-zone">
          <div className="container">
            <h1>ThinkClear</h1>
            <p>Structured cognition for night thinkers.</p>

            <ThoughtCanvas
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
            />

            {output && (
              <div style={{ marginTop: '3rem' }}>
                <OutputSection output={output} />
              </div>
            )}

            <p className="text-subtle" style={{ marginTop: '2rem' }}>
              {trial.remaining > 0
                ? `${trial.remaining} free clarifications remaining today`
                : 'Free usage complete for today'}
            </p>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="section about">
          <div className="container">
            <h2>What is ThinkClear?</h2>
            <p>
              A quiet space to untangle thoughts without judgment.
              No feeds. No noise. Just structure.
            </p>
          </div>
        </section>

        {/* ================= PRICING ================= */}
        <section id="pricing" className="section pricing">
          <div className="container">
            <h2>Continue with clarity</h2>
            <p>You can use ThinkClear for free every day.</p>

            <div className="pricing-card">
              <div className="price">
                ₹199<span>/month</span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShowSignIn(true)}
              >
                Unlock unlimited thinking
              </button>
            </div>

            <div className="pricing-card">
              <div className="price">
                ₹99<span>one-time pass</span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShowSignIn(true)}
              >
                try thinking with clarity once
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= SIGN IN MODAL ================= */}
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)}>
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in to ThinkClear
          </h2>

          <p className="text-white/70 mb-4">
            No spam. No feeds. Just clarity.
          </p>

          {sent ? (
            <p className="text-green-400">
              Check your email for the magic link ✨
            </p>
          ) : (
            <>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white mb-3"
               />
              <button
                   className="btn btn-primary"
                   onClick={() => setShowSignIn(true)}
                   >
                   Continue with email
                 </button>
               {loading ? 'Sending…' : 'Continue with email'}
            </>
          )}
        </SignInModal>
      )}
    </>
  );
}