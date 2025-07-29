import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import type { Metadata } from 'next';
import './globals.css';
import theme from './theme';

export const metadata: Metadata = {
  title: 'Next App Mantine Tailwind Template',
  description: 'Next App Mantine Tailwind Template',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
