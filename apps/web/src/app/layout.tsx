import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { safeEnv, envError } from "@/env";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

// Generate metadata with safe environment values
export async function generateMetadata(): Promise<Metadata> {
  const env = safeEnv();

  return {
    title: env.NEXT_PUBLIC_APP_NAME || "Web App",
    description: "A modern web application with Mantine and Tailwind CSS",
    metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200"),
  };
}

/**
 * Root layout that applies to ALL routes
 *
 * This layout includes:
 * - HTML structure with Mantine HTML props
 * - Color scheme script for theme support
 * - Error boundaries to prevent white screens
 * - Environment validation with graceful fallbacks
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <AppProviders envError={envError}>{children}</AppProviders>
      </body>
    </html>
  );
}
