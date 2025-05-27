import './styles.css';

import '@mantine/core/styles.css';
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from '@mantine/core';

import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';

import { Footer } from './components/footer';
import { Header } from './components/header';

import type { ReactNode } from 'react';

// Create a custom theme
const theme = createTheme({
  // You can customize the theme here
});

interface RootLayoutProperties {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
}

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <html className={cn(fonts, 'scroll-smooth')} lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Header dictionary={dictionary} />
          {children}
          <Footer />
        </MantineProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
