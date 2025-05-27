import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from '@arcjet/next';

import { keys } from './keys';

const arcjetKey = keys().ARCJET_KEY;

export const secure = async (
  allow: (ArcjetWellKnownBot | ArcjetBotCategory)[],
  sourceRequest?: Request,
): Promise<void> => {
  if (!arcjetKey) {
    return;
  }

  const base = arcjet({
    // Identify the user by their IP address
    characteristics: ['ip.src'],
    // Get your site key from https://app.arcjet.com
    key: arcjetKey,
    rules: [
      // Protect against common attacks with Arcjet Shield
      shield({
        // Will block requests. Use "DRY_RUN" to log only
        mode: 'LIVE',
      }),
      // Other rules are added in different routes
    ],
  });

  const req = sourceRequest ?? (await request());
  const aj = base.withRule(detectBot({ allow, mode: 'LIVE' }));
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    console.warn(`Arcjet decision: ${JSON.stringify(decision.reason, null, 2)}`);

    if (decision.reason.isBot()) {
      throw new Error('No bots allowed');
    }

    if (decision.reason.isRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    throw new Error('Access denied');
  }
};
