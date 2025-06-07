import { flag } from '@vercel/flags/next';

export const homeFlag = flag<boolean>({
  decide: () => Math.random() > 0.5,
  key: 'home',
});
