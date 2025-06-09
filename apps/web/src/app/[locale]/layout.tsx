import { AppLayout, AppLayoutProvider } from "@/components/AppLayout";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { GuestActionsProvider } from "@/contexts/GuestActionsContext";
import { getDictionary } from "@/i18n";
import { getCollections, getNavigation } from "@/data/data-service";

import type { Metadata } from "next";

import "@repo/design-system/mantine-ciseco/styles.css";

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

  // Fetch navigation data
  const navigationMenu = await getNavigation();
  const allCollections = await getCollections();
  const featuredCollection = allCollections?.[10]; // Using index 10 as before

  return (
    <GuestActionsProvider>
      <AppLayoutProvider>
        <PerformanceMonitor>
          <AppLayout
            featuredCollection={featuredCollection}
            locale={locale}
            navigationMenu={navigationMenu}
            dict={dict}
          >
            {children}
          </AppLayout>
        </PerformanceMonitor>
      </AppLayoutProvider>
    </GuestActionsProvider>
  );
}
