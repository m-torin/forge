'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface CartDrawerProps {
  children: React.ReactNode;
}

export default function CartDrawer({ children }: CartDrawerProps) {
  const router = useRouter();

  useEffect(() => {
    // Handle escape key to close drawer
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div onClick={() => router.back()} className="absolute inset-0 bg-black/50" />

      {/* Drawer Content - Slide in from right */}
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
