'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectToHomeProps {
  locale: string;
}

export function RedirectToHome({ locale }: RedirectToHomeProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/home`);
  }, [router, locale]);

  return null;
}
