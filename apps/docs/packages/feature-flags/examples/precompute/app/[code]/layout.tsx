import type { ReactNode } from 'react';

export async function generateStaticParams() {
  // returning an empty array is enough to enable ISR
  return [];
}

export default async function Layout({ children }: { children: ReactNode }) {
  return children;
}
