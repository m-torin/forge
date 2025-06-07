import { flag } from '@vercel/flags/next';

export const basicEdgeMiddlewareFlag = flag<boolean>({
  decide: () => Math.random() > 0.5,
  key: 'edge-middleware-flag',
});
