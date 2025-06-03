import { GoogleAnalytics } from './google';
import { keys } from './keys';
import { PostHogProvider } from './posthog/client';
import { VercelAnalytics } from './vercel';

import type { ReactNode } from 'react';

interface AnalyticsProviderProps {
  readonly children: ReactNode;
}

const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <PostHogProvider>
    {children}
    <VercelAnalytics />
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />}
  </PostHogProvider>
);

// Export feature flag functions (client-safe versions)
export { flag, flags, useFlag } from './flags-client';
export { FLAGS } from './types/flags';

// Export flag helper functions
export {
  getAIFlags,
  getAnalyticsFlags,
  getAuthFlags,
  getEmailFlags,
  getPaymentFlags,
  getUIFlags,
  getWorkflowFlags,
} from './flag-helpers';

// Re-export analytics functions
export { analytics } from './posthog/client';

// Export types separately for packages to avoid circular deps
export type * from './types/flags';

// Export Vercel Toolbar components (client-safe only)
export { Toolbar } from './components/toolbar';
export { ToolbarProvider } from './toolbar-provider';
