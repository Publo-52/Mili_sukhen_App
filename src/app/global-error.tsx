'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#06040a] text-slate-100 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-5 p-6 rounded-3xl bg-[#0e091b] border border-rose-500/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-white">Suksharmi Sanctuary</h2>
          <p className="text-xs text-slate-300">
            A temporary connection pause occurred. Click below to reload cleanly.
          </p>
          <button
            onClick={() => {
              try {
                reset();
              } catch {
                window.location.reload();
              }
            }}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider shadow-lg"
          >
            Reload Universe
          </button>
        </div>
      </body>
    </html>
  );
}
