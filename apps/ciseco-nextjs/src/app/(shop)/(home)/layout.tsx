import Header from '@/components/Header/Header';
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

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return (
    <ApplicationLayout header={<Header hasBorderBottom={false} />}>{children}</ApplicationLayout>
  );
}
