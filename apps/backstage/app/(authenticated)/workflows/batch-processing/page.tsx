'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BatchProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to integrations page as batch processing is handled there
    router.push('/workflows/integrations');
  }, [router]);

  return null;
}
