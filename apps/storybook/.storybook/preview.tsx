import { MantineProvider } from '@mantine/core';
import { withThemeByClassName } from '@storybook/addon-themes';

// Temporarily comment out auth decorator until proper export is available
// import { authDecorators } from '@repo/auth/testing/mocks';

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
    // authDecorators.authenticated(),
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
