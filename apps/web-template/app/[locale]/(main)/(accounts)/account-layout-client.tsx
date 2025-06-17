'use client';

import { EmailVerificationBanner } from '@/components/auth';

export function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}