/**
 * Server-side security exports for Next.js
 *
 * This file provides server-side security functionality specifically for Next.js applications.
 */

import 'server-only';
import arcjet, {
  type ArcjetBotCategory,
  type ArcjetWellKnownBot,
  detectBot,
  request,
  shield,
} from '@arcjet/next';

import { keys } from '../keys';

// Re-export all server functionality
export * from './server';

// Re-export middleware utilities for Next.js
export { noseconeMiddleware, noseconeOptions } from '../middleware';

// Next.js specific Arcjet security
const arcjetKey = keys().ARCJET_KEY;

export const secure = async (
  allow: (ArcjetBotCategory | ArcjetWellKnownBot)[],
  sourceRequest?: any,
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
    // Log to error tracking service instead of console
    // console.warn(`Arcjet decision: ${JSON.stringify(decision.reason, null, 2)}`);

    if (decision.reason.isBot()) {
      throw new Error('No bots allowed');
    }

    if (decision.reason.isRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    throw new Error('Access denied');
  }
};

// Re-export Arcjet types for Next.js
export type { ArcjetBotCategory, ArcjetWellKnownBot };
