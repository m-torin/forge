import { flag } from '@vercel/flags/next';

export const basicEdgeMiddlewareFlag = flag<boolean>({
  key: 'edge-middleware-flag',
  decide: () => Math.random() > 0.5,
});
