import "./globals.css";

import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { createMetadata } from "@repo/seo/metadata";

import theme from "./theme";

import type { ReactNode } from "react";

export const metadata = createMetadata({
  description: "Next App Mantine Tailwind Template with Internationalization",
  title: "Template App",
});

interface RootLayoutProperties {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProperties) => {
  return (
    <html className="scroll-smooth" lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="antialiased">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
