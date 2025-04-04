import { ThemeProvider as NextThemeProvider } from 'next-themes';

import type { ThemeProviderProps } from 'next-themes';

export const ThemeProvider = ({
  children,
  ...properties
}: ThemeProviderProps) => (
  <NextThemeProvider
    disableTransitionOnChange
    attribute="class"
    defaultTheme="system"
    enableSystem
    {...properties}
  >
    {children}
  </NextThemeProvider>
);
