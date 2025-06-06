import { flag } from '@vercel/flags/next';

export const greetingFlag = flag<string>({
  key: 'greeting',
  options: [
    { label: 'Hello world', value: 'Hello world' },
    { label: 'Hi', value: 'Hi' },
    { label: 'Hola', value: 'Hola' },
  ],
  decide: () => 'Hello world',
});
