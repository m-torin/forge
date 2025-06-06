import { flag } from '@vercel/flags/next';

export const showSummerSale = flag({
  key: 'summer-sale',
  decide: () => false,
});

export const showBanner = flag({
  key: 'banner',
  decide: () => false,
});

// a group of feature flags to be precomputed
export const marketingFlags = [showSummerSale, showBanner] as const;
