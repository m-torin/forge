import 'server-only';
import { Liveblocks as LiveblocksNode } from '@liveblocks/node';

import { keys } from './keys';

interface AuthenticateOptions {
  orgId: string;
  userId: string;
  userInfo: Liveblocks['UserMeta']['info'];
}

let hasLoggedWarning = false;

export const authenticate = async ({ orgId, userId, userInfo }: AuthenticateOptions) => {
  const secret = keys().LIVEBLOCKS_SECRET;

  if (!secret) {
    if (!hasLoggedWarning) {
      console.warn(
        '[Collaboration] LIVEBLOCKS_SECRET not configured. Real-time collaboration is disabled.',
      );
      hasLoggedWarning = true;
    }

    // Return a mock response when Liveblocks is not configured
    return new Response(JSON.stringify({ error: 'Collaboration not configured' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 501, // Not Implemented
    });
  }

  const liveblocks = new LiveblocksNode({ secret });

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(userId, { userInfo });

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user write access on their organization
  session.allow(`${orgId}:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { body, status } = await session.authorize();

  return new Response(body, { status });
};
