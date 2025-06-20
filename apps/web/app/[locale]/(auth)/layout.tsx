import type { ReactNode } from 'react';
import { AuthErrorBoundary } from '@/components/auth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="relative">
        {/* Optional: Add a decorative background pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[50%] top-0 h-[500px] w-[500px] -translate-x-[50%] rounded-full bg-primary-50/20 blur-3xl dark:bg-primary-900/10" />
        </div>

        <AuthErrorBoundary>{children}</AuthErrorBoundary>
      </div>
    </div>
  );
}
