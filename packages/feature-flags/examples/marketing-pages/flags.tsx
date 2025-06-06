import { flag, dedupe } from '@vercel/flags/next';
import type { ReadonlyRequestCookies } from '@vercel/flags';
import { getOrGenerateVisitorId } from './get-or-generate-visitor-id';

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
  key: 'marketing-ab-test-flag',
  // use identify to establish the evaluation context,
  // which will be passed as "entities" to the decide function
  identify,
  decide({ entities }) {
    if (!entities?.visitor) return false;
    return /^[a-n0-5]/i.test(entities.visitor.id);
  },
});

// Another marketing flag
export const showSummerSale = flag({
  key: 'summer-sale',
  decide: () => false,
});

export const showBanner = flag({
  key: 'banner',
  decide: () => false,
});

// a group of feature flags to be precomputed
export const marketingFlags = [marketingAbTest, showSummerSale, showBanner] as const;
