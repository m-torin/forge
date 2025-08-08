/**
 * Better Auth API Handler for Next.js App Router
 *
 * Handles all authentication requests including sign-in, sign-up, sessions, etc.
 */

import { auth } from '#/lib/auth-config';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
