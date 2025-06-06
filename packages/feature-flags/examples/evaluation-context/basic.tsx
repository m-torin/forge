import { flag } from '@vercel/flags/next';

export const exampleFlag = flag<boolean>({
  key: 'identify-example-flag',
  identify() {
    return { user: { id: 'user1' } };
  },
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
});
