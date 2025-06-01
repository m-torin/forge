'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle escape key to close modal
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => router.back()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            router.back();
          }
        }}
        role="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        tabIndex={0}
      />

      {/* Modal Content */}
      <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-neutral-900">
        {/* Close button */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <svg stroke="currentColor" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
