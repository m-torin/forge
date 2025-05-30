import "./globals.css";

import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import { Toolbar } from "@repo/feature-flags/components/toolbar";

import theme from "./theme";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: "Next App Mantine Tailwind Template with Internationalization",
  title: "Template App",
};

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
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
