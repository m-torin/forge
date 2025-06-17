import { MantineProvider } from '@mantine/core';
import { withThemeByClassName } from '@storybook/addon-themes';

import { withAuthMock } from '@repo/auth/mocks/storybook-decorator';

import { Preview } from '@storybook/nextjs';

// Import global styles
import '../styles/globals.css';

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      defaultTheme: 'light',
      themes: {
        dark: 'dark',
        light: 'light',
      },
    }),
    withAuthMock,
    (Story: any) => {
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
  ],
  parameters: {
    chromatic: {
      modes: {
        dark: {
          className: 'dark',
          theme: 'dark',
        },
        light: {
          className: 'light',
          theme: 'light',
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    themes: {
      default: 'light',
      list: [
        { class: 'light', color: '#ffffff', name: 'light' },
        { class: 'dark', color: '#000000', name: 'dark' },
      ],
    },
  },
};

export default preview;
