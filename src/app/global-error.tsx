'use client';

// global-error.tsx handles errors in the Root Layout (layout.tsx)
// This is different from error.tsx which handles segment-level errors

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Root Error:', error?.message || 'Unknown error');

    // Auto-reset after 3 seconds
    const timer = setTimeout(() => {
      try {
        reset();
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, reset]);

  return (
    <html lang="en">
      <body style={{ background: '#06040a', margin: 0, padding: 0 }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>❤️</div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Something went momentarily quiet ✨
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
            Reconnecting automatically...
          </p>
          <button
            onClick={() => {
              try { reset(); } catch { window.location.href = '/'; }
            }}
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'linear-gradient(to right, #e11d48, #9333ea)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
