'use client';

import dynamic from 'next/dynamic';

export default function TerminalWrapper() {
  const Terminal = dynamic(() => import('@/components/Terminal'), {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-[#00FF41] font-mono">Loading terminal...</div>
      </div>
    ),
  });

  return <Terminal />;
}