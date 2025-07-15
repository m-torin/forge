import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import theme from './theme';
import './unified-theme.css';
// import { viewport as seoViewport } from '@repo/seo/server/next';
import { createOrganizationStructuredData } from '#/lib/seo';
import { env } from '#/root/env';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Mantine + Tailwind Template',
    default: 'Mantine + Tailwind Template',
  },
  description:
    'A modern Next.js template combining the power of Mantine UI components with Tailwind CSS utilities',
  keywords: [
    'Next.js',
    'React',
    'TypeScript',
    'Mantine',
    'Tailwind CSS',
    'Template',
    'Starter Kit',
    'Full Stack',
    'SSR',
    'Analytics',
    'Feature Flags',
    'Internationalization',
  ],
  authors: [
    {
      name: 'Template Team',
      url: 'https://github.com/your-repo/mantine-tailwind-template',
    },
  ],
  creator: 'Template Team',
  publisher: 'Template Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      es: '/es',
      de: '/de',
      fr: '/fr',
      pt: '/pt',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Mantine + Tailwind Template',
    title: 'Mantine + Tailwind Template',
    description:
      'A modern Next.js template combining Mantine UI components with Tailwind CSS utilities',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mantine + Tailwind Template',
    description:
      'A modern Next.js template combining Mantine UI components with Tailwind CSS utilities',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification IDs as needed
    // google: 'your-google-verification-id',
    // yandex: 'your-yandex-verification-id',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = createOrganizationStructuredData();

  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
