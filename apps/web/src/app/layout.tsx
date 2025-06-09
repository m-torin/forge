import { env } from "@/env";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { VercelToolbar } from "@vercel/toolbar/next";

import { ObservabilityProvider } from "@repo/observability/client/next";

import theme from "./theme";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  description: "A modern web application with internationalization support",
  icons: {
    apple: "/icon.png",
    icon: "/icon.png",
  },
  title: "Web New App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>
          <ObservabilityProvider
            config={{
              providers: {
                sentry: {
                  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
                  environment: env.NODE_ENV,
                  replaysSessionSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
                  tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
                  // Debug mode removed to prevent bundle conflicts
                },
              },
            }}
          >
            {children}
          </ObservabilityProvider>
        </MantineProvider>
        {process.env.NODE_ENV === 'development' && <VercelToolbar />}
      </body>
    </html>
  );
}
