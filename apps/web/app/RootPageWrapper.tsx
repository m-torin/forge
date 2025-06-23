"use client";

import { Providers } from "./[locale]/providers";
import { AppLayout } from "@/components/app-layout";
import type { ExtendedDictionary } from "@/i18n";

interface RootPageWrapperProps {
  children: React.ReactNode;
  dictionary: ExtendedDictionary;
}

/**
 * Wrapper for root page content that provides the necessary providers
 * and app layout for the English root route.
 */
export function RootPageWrapper({ children, dictionary }: RootPageWrapperProps) {
  return (
    <Providers>
      <AppLayout locale="en" dictionary={dictionary}>
        {children}
      </AppLayout>
    </Providers>
  );
}