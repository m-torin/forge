import { AppLayout, AppLayoutProvider } from "@/components/AppLayout";
import { getDictionary } from "@/i18n";

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
    <AppLayoutProvider>
      <AppLayout locale={locale} dict={dict}>
        {children}
      </AppLayout>
    </AppLayoutProvider>
  );
}
