'use client';

import { logDebug } from '@repo/observability';
import { VercelToolbar } from '@vercel/toolbar/next';
import { useSession } from 'next-auth/react';

export function ConditionalVercelToolbar() {
  const { data: session } = useSession();

  // Show toolbar in development or for authenticated regular users
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isAuthenticatedRegularUser = session?.user && session.user.type === 'regular';

  const shouldShowToolbar = true; // Force show for debugging || isDevelopment || isAuthenticatedRegularUser;

  // Debug logging
  logDebug('Vercel Toolbar configuration', {
    isDevelopment,
    session: session ? { user: session.user } : null,
    isAuthenticatedRegularUser,
    shouldShowToolbar,
  });

  return shouldShowToolbar ? <VercelToolbar /> : null;
}
