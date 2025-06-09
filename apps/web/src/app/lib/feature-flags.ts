import { dedupe, flag } from '@vercel/flags/next';

import { postHogServerAdapter as adapter } from '@repo/feature-flags/server/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

// Define entities for type safety
interface Entities {
  locale?: { code: string };
  user?: { id: string };
}

// Dedupe the identify function to prevent duplicate calls
const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('user-id')?.value;
  const locale = cookies.get('locale')?.value;

  return {
    locale: locale ? { code: locale } : undefined,
    user: userId ? { id: userId } : undefined,
  };
});

// Example: New homepage hero design
export const newHeroDesignFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'new-hero-design',
});

// Example: Enhanced product cards
export const enhancedProductCardsFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'enhanced-product-cards',
});

// Example: Mobile-first navigation
export const mobileFirstNavFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'mobile-first-navigation',
});

// Example: Checkout optimization test
export const checkoutVariantFlag = flag<string, Entities>({
  identify,
  adapter: adapter.featureFlagValue(),
  defaultValue: 'original',
  key: 'checkout-variant',
  options: [
    { label: 'Original', value: 'original' },
    { label: 'One Page', value: 'one-page' },
    { label: 'Multi Step', value: 'multi-step' },
  ],
});

// Example: Theme configuration with payload
interface ThemeConfig {
  borderRadius: number;
  enableAnimations: boolean;
  primaryColor: string;
}

export const themeConfigFlag = flag<ThemeConfig, Entities>({
  identify,
  adapter: adapter.featureFlagPayload<ThemeConfig>((payload) => ({
    borderRadius: payload?.borderRadius || 8,
    enableAnimations: payload?.enableAnimations ?? true,
    primaryColor: payload?.primaryColor || '#0070f3',
  })),
  defaultValue: {
    borderRadius: 8,
    enableAnimations: true,
    primaryColor: '#0070f3',
  },
  key: 'theme-config',
});