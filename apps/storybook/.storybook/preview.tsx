import { withThemeByClassName } from '@storybook/addon-themes';

import { withAuthMock } from '@repo/auth/mocks/storybook-decorator';
import { MantineProvider, TooltipProvider } from '@repo/design-system/uix';

import type { Preview } from '@storybook/nextjs';

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
    (Story) => {
      return (
        <MantineProvider>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
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
        { name: 'light', class: 'light', color: '#ffffff' },
        { name: 'dark', class: 'dark', color: '#000000' },
      ],
    },
  },
};

export default preview;
