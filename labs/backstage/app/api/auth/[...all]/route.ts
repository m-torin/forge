import { auth } from '@repo/auth/server/next';

export const { GET, POST } = auth.handler;
