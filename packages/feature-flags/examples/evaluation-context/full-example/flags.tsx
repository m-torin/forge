import { dedupe, flag } from '@vercel/flags/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

interface Entities {
  user?: { id: string };
}

const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  // This could read a JWT instead
  const userId = cookies.get('identify-example-user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
});

export const identifyExampleFlag = flag<boolean, Entities>({
  decide({ entities }) {
    if (!entities?.user) return false;
    return entities.user.id === 'user1';
  },
  identify,
  key: 'identify-example-flag',
});
