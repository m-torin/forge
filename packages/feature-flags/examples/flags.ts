import { dedupe, flag } from '../src/server-next';
import { getOrGenerateVisitorId } from '../src/shared/utils';

import type { ReadonlyRequestCookies } from '@vercel/flags';

// Simple feature flag
export const newFeatureFlag = flag<boolean>({
  decide: () => false,
  key: 'new-feature',
});

// A/B test flag with visitor targeting
interface VisitorEntities {
  visitor?: { id: string };
}

const identifyVisitor = dedupe(
  async ({ cookies }: { cookies: ReadonlyRequestCookies }): Promise<VisitorEntities> => {
    const visitorId = await getOrGenerateVisitorId(cookies);
    return { visitor: { id: visitorId } };
  },
);

export const heroTestFlag = flag<'A' | 'B'>({
  decide: ({ entities }) => {
    if (!entities?.visitor) return 'A';
    // Use first character of ID for 50/50 split
    return entities.visitor.id[0] < '8' ? 'A' : 'B';
  },
  identify: identifyVisitor,
  key: 'hero-test',
  options: [
    { label: 'Hero Variant A', value: 'A' },
    { label: 'Hero Variant B', value: 'B' },
  ],
});

// Premium feature flag with user targeting
interface UserEntities {
  user?: { id: string; plan: 'free' | 'pro' | 'enterprise' };
}

const identifyUser = dedupe(
  async ({ cookies }: { cookies: ReadonlyRequestCookies }): Promise<UserEntities> => {
    const token = cookies.get('auth-token')?.value;
    if (!token) return {};

    // In a real app, decode JWT or fetch user data
    // For demo, just return mock data
    return {
      user: {
        id: 'user-123',
        plan: 'pro',
      },
    };
  },
);

export const premiumFeatureFlag = flag<boolean>({
  decide: ({ entities }) => {
    const plan = entities?.user?.plan;
    return plan === 'pro' || plan === 'enterprise';
  },
  identify: identifyUser,
  key: 'premium-feature',
});

// Marketing flags array for precomputation
export const marketingFlags = [newFeatureFlag, heroTestFlag] as const;
