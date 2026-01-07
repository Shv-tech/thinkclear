'use client';

export default function SignInModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal">
        <h2>Sign in to ThinkClear</h2>
        <p>No passwords. No feeds. Just clarity.</p>

        <a
          href="/api/auth/google/start"
          className="btn-primary"
          style={{ width: '100%', display: 'block', textAlign: 'center' }}
        >
          Continue with Google
        </a>

        <button
          onClick={onClose}
          style={{ marginTop: 12, background: 'none', color: '#aaa' }}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
