"use client";

import type { Locale } from "#/lib/i18n";
import { NextIntlClientProvider } from "@repo/internationalization/client/next";

interface ProvidersProps {
  locale: Locale;
  children: React.ReactNode;
}

export function Providers({ locale, children }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
  );
}
