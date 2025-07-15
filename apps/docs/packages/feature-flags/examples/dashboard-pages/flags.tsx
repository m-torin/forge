import { dedupe, flag } from '@vercel/flags/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

interface Entities {
  user?: { id: string };
}

const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('dashboard-user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
});

export const dashboardFlag = flag<boolean, Entities>({
  decide({ entities }) {
    if (!entities?.user) return false;
    // Allowed users could be loaded from Edge Config or elsewhere
    const allowedUsers = ['user1'];

    return allowedUsers.includes(entities.user.id);
  },
  identify,
  key: 'dashboard-flag',
});
