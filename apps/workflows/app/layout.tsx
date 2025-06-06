import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Inter } from 'next/font/google';

import { theme } from './theme';

import type { Metadata } from 'next';

import './globals.css';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  authors: [{ name: 'Workflows Team' }],
  description: 'Next.js 15 + React 19 powered workflow execution system with real-time monitoring',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/favicon.ico',
  },
  keywords: ['workflows', 'qstash', 'nextjs', 'react', 'realtime'],
  robots: 'index, follow',
  title: 'Workflows - High-Performance Workflow Engine',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Notifications position="top-right" zIndex={1000} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
