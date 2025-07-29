import { flag } from '@vercel/flags/next';

interface Entities {
  user?: { id: string };
}

export const exampleFlag = flag<boolean, Entities>({
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
  identify() {
    return { user: { id: 'user1' } };
  },
  key: 'identify-example-flag',
});
