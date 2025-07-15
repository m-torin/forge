import { dedupe, flag } from '@vercel/flags/next';

import { getOrGenerateVisitorId } from './get-or-generate-visitor-id';

import type { ReadonlyRequestCookies } from '@vercel/flags';

interface Entities {
  visitor?: { id: string };
}

// identify who is requesting the page
const identify = dedupe(
  async ({ cookies }: { cookies: ReadonlyRequestCookies }): Promise<Entities> => {
    const visitorId = await getOrGenerateVisitorId(cookies);
    return { visitor: visitorId ? { id: visitorId } : undefined };
  },
);

export const marketingAbTest = flag<boolean, Entities>({
  decide({ entities }) {
    if (!entities?.visitor) return false;
    return /^[a-n0-5]/i.test(entities.visitor.id);
  },
  // use identify to establish the evaluation context,
  // which will be passed as "entities" to the decide function
  identify,
  key: 'marketing-ab-test-flag',
});

// Another marketing flag
export const showSummerSale = flag({
  decide: () => false,
  key: 'summer-sale',
});

export const showBanner = flag({
  decide: () => false,
  key: 'banner',
});

// a group of feature flags to be precomputed
export const marketingFlags = [marketingAbTest, showSummerSale, showBanner] as const;
