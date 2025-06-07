import { flag } from '@vercel/flags/next';

export const exampleFlag = flag<boolean>({
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
  identify() {
    return { user: { id: 'user1' } };
  },
  key: 'identify-example-flag',
});
