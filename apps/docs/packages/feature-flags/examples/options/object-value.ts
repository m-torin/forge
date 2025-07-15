import { flag } from '@vercel/flags/next';

interface GreetingConfig {
  locale: string;
  message: string;
  style?: string;
}

export const greetingFlag = flag<GreetingConfig>({
  decide: () => ({
    locale: 'en',
    message: 'Hello world',
    style: 'friendly',
  }),
  key: 'greeting',
  options: [
    {
      label: 'Hello world',
      value: {
        locale: 'en',
        message: 'Hello world',
        style: 'friendly',
      },
    },
    {
      label: 'Hola mundo',
      value: {
        locale: 'es',
        message: 'Hola mundo',
        style: 'formal',
      },
    },
  ],
});
