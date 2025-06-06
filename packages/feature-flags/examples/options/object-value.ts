import { flag } from '@vercel/flags/next';

interface GreetingConfig {
  message: string;
  locale: string;
  style?: string;
}

export const greetingFlag = flag<GreetingConfig>({
  key: 'greeting',
  options: [
    {
      label: 'Hello world',
      value: {
        message: 'Hello world',
        locale: 'en',
        style: 'friendly',
      },
    },
    {
      label: 'Hola mundo',
      value: {
        message: 'Hola mundo',
        locale: 'es',
        style: 'formal',
      },
    },
  ],
  decide: () => ({
    message: 'Hello world',
    locale: 'en',
    style: 'friendly',
  }),
});
