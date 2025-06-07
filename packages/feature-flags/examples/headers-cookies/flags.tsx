import { flag } from '@vercel/flags/next';

interface Entities {
  user?: { id: string };
}

export const exampleFlag = flag<boolean, Entities>({
  decide({ entities }) {
    return entities?.user?.id === 'user1';
  },
  identify({ cookies, headers }) {
    // access to normalized headers and cookies here
    headers.get('auth');
    cookies.get('auth')?.value;

    return { user: { id: 'user1' } };
  },
  key: 'identify-example-flag',
});
