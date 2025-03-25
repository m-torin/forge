import type { ReactNode } from 'react';
import { GoogleAnalytics } from './google';
import { keys } from './keys';
import { PostHogProvider } from './posthog/client';
import { VercelAnalytics } from './vercel';

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = keys();
  
  return (
    <PostHogProvider>
      {children}
      <VercelAnalytics />
      {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </PostHogProvider>
  );
};
