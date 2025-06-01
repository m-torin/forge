'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Cart page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button onClick={() => reset()} className="mt-4 rounded bg-primary-500 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
