import { type Metadata } from 'next';

import { ApplicationLayout } from '../application-layout';

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
  title: 'Ciseco',
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ApplicationLayout>
      {children}
    </ApplicationLayout>
  );
}
