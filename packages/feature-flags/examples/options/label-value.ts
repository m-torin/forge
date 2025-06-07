import { flag } from '@vercel/flags/next';

export const greetingFlag = flag<string>({
  decide: () => 'Hello world',
  key: 'greeting',
  options: [
    { label: 'Hello world', value: 'Hello world' },
    { label: 'Hi', value: 'Hi' },
    { label: 'Hola', value: 'Hola' },
  ],
});
