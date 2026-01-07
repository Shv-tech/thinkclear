'use client';

import { useState } from 'react';

interface SignInModalProps {
  onClose: () => void;
  children?: React.ReactNode;
}

export default function SignInModal
({ onClose, children }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async () => {
    // hard guard
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send link');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="modal" role="dialog" aria-modal="true">
        {!sent ? (
          <>
            <h2 style={{ marginBottom: 8 }}>Sign in to ThinkClear</h2>
            <p style={{ opacity: 0.7, marginBottom: 16 }}>
              No passwords. No feeds. Just clarity.
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #333',
                background: '#0f0f14',
                color: '#fff',
                marginBottom: 16,
              }}
            />

            {error && (
              <p style={{ color: '#ff6b6b', marginBottom: 12 }}>
                {error}
              </p>
            )}

            <button
              type="button" // 🔴 CRITICAL: prevents GET
              className="btn-primary"
              onClick={handleSendLink}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending…' : 'Continue with email'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 12,
                background: 'none',
                border: 'none',
                color: '#aaa',
                width: '100%',
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2>Check your inbox</h2>
            <p style={{ opacity: 0.7, marginTop: 8 }}>
              We’ve sent a magic link to:
            </p>
            <p style={{ fontWeight: 500, marginTop: 6 }}>{email}</p>

            <p style={{ opacity: 0.6, marginTop: 16 }}>
              Click the link to continue.  
              You can close this window.
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={onClose}
              style={{ marginTop: 20, width: '100%' }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </>
  );
}
