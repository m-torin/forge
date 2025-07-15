import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  other: {
    // Custom properties
    backgroundColor: '#f0f0f0', // Example custom background color
  },
  headings: {
    fontFamily:
      'var(--font-noto-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    sizes: {
      h1: { fontSize: rem(36), lineHeight: '1.2' },
      h2: { fontSize: rem(30), lineHeight: '1.3' },
      h3: { fontSize: rem(24), lineHeight: '1.35' },
      h4: { fontSize: rem(20), lineHeight: '1.4' },
      h5: { fontSize: rem(18), lineHeight: '1.45' },
      h6: { fontSize: rem(16), lineHeight: '1.5' },
    },
  },
});
