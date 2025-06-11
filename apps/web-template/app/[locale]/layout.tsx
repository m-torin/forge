import type { Metadata } from "next";
import {
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { getDictionary } from "@/i18n";
import { Providers } from "../providers";
import { AppLayout, AppLayoutProvider } from "@/components/AppLayout";
import "@/styles/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.app?.brand || "Web Template",
    description: dict.app?.appDescription || "Web Template Application",
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
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <Providers>
          <AppLayoutProvider>
            <AppLayout
              dict={dict}
              locale={locale}
              header={{ height: 100 }}
              padding="md"
            >
              {children}
            </AppLayout>
          </AppLayoutProvider>
        </Providers>
      </body>
    </html>
  );
}
