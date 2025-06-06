import { flag } from '@vercel/flags/next';

export const homeFlag = flag<boolean>({
  key: 'home',
  decide: () => Math.random() > 0.5,
});
