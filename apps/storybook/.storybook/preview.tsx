import { MantineProvider } from '@mantine/core';
import { withThemeByClassName } from '@storybook/addon-themes';

// Temporarily comment out auth decorator until proper export is available
// import { authDecorators } from '@repo/auth/testing/mocks';

import type { Preview } from '@storybook/nextjs';

// Import global styles
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
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
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
        { name: 'gray', value: '#f8f9fa' },
      ],
    },
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
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: {
        contentsSelector: '.sbdocs-content',
        headingSelector: 'h1, h2, h3',
        title: 'Table of Contents',
      },
    },
    layout: 'centered',
    themes: {
      default: 'light',
      list: [
        { class: 'light', color: '#ffffff', name: 'light' },
        { class: 'dark', color: '#000000', name: 'dark' },
      ],
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
      defaultViewport: 'responsive',
    },
  },
};

export default preview;
