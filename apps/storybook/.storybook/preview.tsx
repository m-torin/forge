import { TooltipProvider } from '@repo/design-system/components/ui/tooltip';
import { ThemeProvider } from '@repo/design-system/providers/theme';
import { MantineProvider } from '@repo/design-system/providers/mantine-provider';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import { withAuthMock } from '@repo/auth/mocks/storybook-decorator';

// Import global styles
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
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
    chromatic: {
      modes: {
        light: {
          theme: 'light',
          className: 'light',
        },
        dark: {
          theme: 'dark',
          className: 'dark',
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    withAuthMock,
    (Story) => {
      return (
        <MantineProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Story />
            </TooltipProvider>
          </ThemeProvider>
        </MantineProvider>
      );
    },
  ],
};

export default preview;
