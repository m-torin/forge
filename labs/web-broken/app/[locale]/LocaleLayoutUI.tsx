"use client";

import { Providers } from "./providers";
import { AppLayout } from "@/components/app-layout";
import type { ExtendedDictionary } from "@/i18n";

interface LocaleLayoutUIProps {
  children: React.ReactNode;
  locale: string;
  dictionary: ExtendedDictionary;
}

/**
 * Client-side layout UI component for locale-specific layouts
 *
 * This component handles all client-side functionality including:
 * - Mantine providers and configuration
 * - Auth provider
 * - Theme and notification setup
 * - Locale-specific configurations
 */
export function LocaleLayoutUI({
  children,
  locale,
  dictionary,
}: LocaleLayoutUIProps): React.JSX.Element {
  return (
    <Providers>
      <AppLayout locale={locale} dictionary={dictionary}>
        {children}
      </AppLayout>
    </Providers>
  );
}
