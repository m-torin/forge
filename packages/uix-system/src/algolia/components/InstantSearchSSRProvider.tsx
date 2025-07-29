'use client';

import { ReactNode } from 'react';
import { InstantSearchSSRProvider as BaseInstantSearchSSRProvider } from 'react-instantsearch';

interface InstantSearchSSRProviderProps {
  children: ReactNode;
  initialResults?: any;
}

export default function InstantSearchSSRProvider({
  children,
  ...props
}: InstantSearchSSRProviderProps) {
  return <BaseInstantSearchSSRProvider {...props}>{children}</BaseInstantSearchSSRProvider>;
}
