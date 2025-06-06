import { flag } from '@vercel/flags/next';

export const greetingFlag = flag<string>({
  key: 'greeting',
  options: ['Hello world', 'Hi', 'Hola'],
  decide: () => 'Hello world',
});
