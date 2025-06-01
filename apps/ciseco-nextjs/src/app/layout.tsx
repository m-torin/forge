import { type Metadata } from 'next';
import '@/styles/tailwind.css';
import { Poppins } from 'next/font/google';

import { Aside } from '@repo/design-system/ciesco2';

import GlobalClient from './GlobalClient';

const poppins = Poppins({
  display: 'swap',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  description:
    'Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.',
  keywords: [
    'Next.js',
    'Tailwind CSS',
    'TypeScript',
    'Ciseco',
    'Headless UI',
    'Fashion',
    'E-commerce',
  ],
  title: {
    default: 'Ciseco',
    template: '%s - Ciseco',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={poppins.className} lang="en">
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <Aside.Provider>
          {children}

          {/* Client component: Toaster, ... */}
          <GlobalClient />
        </Aside.Provider>
      </body>
    </html>
  );
}
