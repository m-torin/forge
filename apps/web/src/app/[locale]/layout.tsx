import { AppLayout, AppLayoutProvider } from "@/components/AppLayout";
import LocalizedHeader2 from "@/components/LocalizedHeader2";
import { GuestActionsProvider } from "@/contexts/GuestActionsContext";
import { getDictionary } from "@/i18n";
import { Portal } from "@mantine/core";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    description: dict.app?.appDescription || "Web New Application",
    title: dict.app?.brand || "Web New App",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <GuestActionsProvider>
      <AppLayoutProvider>
        <AppLayout locale={locale} dict={dict}>
          {children}
        </AppLayout>

        {/* Portal LocalizedHeader2 to the header target */}
        <Portal target="#header-portal-target">
          <LocalizedHeader2 locale={locale} />
        </Portal>
      </AppLayoutProvider>
    </GuestActionsProvider>
  );
}
