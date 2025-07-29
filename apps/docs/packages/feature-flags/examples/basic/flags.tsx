import { flag } from '@vercel/flags/next';

export const exampleFlag = flag({
  decide: () => true,
  key: 'example-flag',
});
