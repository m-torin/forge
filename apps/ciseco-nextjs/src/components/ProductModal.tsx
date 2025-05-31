'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProductModalProps {
  children: React.ReactNode;
}

export default function ProductModal({ children }: ProductModalProps) {
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
        className="absolute inset-0 bg-black/50"
        onClick={() => router.back()}
      />
      
      {/* Modal Content - Wider for product details */}
      <div className="relative mx-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-neutral-900">
        {/* Close button */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {/* Modal body */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}