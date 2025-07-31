import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import type { Metadata } from 'next';
import './globals.css';
import theme from './theme';

export const metadata: Metadata = {
  title: 'Mantine + Tailwind Template',
  description: 'A modern Next.js template with Mantine UI and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
