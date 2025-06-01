'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SearchModalProps {
  children: React.ReactNode;
}

export default function SearchModal({ children }: SearchModalProps) {
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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-white dark:bg-neutral-900">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <svg stroke="currentColor" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Modal body */}
      <div className="w-full">{children}</div>
    </div>
  );
}
