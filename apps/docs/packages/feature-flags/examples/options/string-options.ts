import { flag } from '@vercel/flags/next';

export const greetingFlag = flag<string>({
  decide: () => 'Hello world',
  key: 'greeting',
  options: ['Hello world', 'Hi', 'Hola'],
});
