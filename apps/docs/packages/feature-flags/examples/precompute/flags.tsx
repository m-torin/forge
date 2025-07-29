import { flag } from '@vercel/flags/next';

export const showSummerSale = flag({
  decide: () => false,
  key: 'summer-sale',
});

export const showBanner = flag({
  decide: () => false,
  key: 'banner',
});

// a group of feature flags to be precomputed
export const marketingFlags = [showSummerSale, showBanner] as const;
