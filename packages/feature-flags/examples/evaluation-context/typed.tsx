import { flag } from '@vercel/flags/next';

interface Entities {
  user?: { id: string };
}

export const exampleFlag = flag<boolean, Entities>({
  key: 'identify-example-flag',
  identify() {
    return { user: { id: 'user1' } };
  },
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
});
