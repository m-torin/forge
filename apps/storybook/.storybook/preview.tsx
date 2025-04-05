import React from "react";
import { Toaster } from "@repo/design-system/components/ui/sonner";
import { TooltipProvider } from "@repo/design-system/components/ui/tooltip";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";

import "@repo/design-system/styles/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Enable a11y addon by default
    a11y: {
      config: {
        rules: [
          {
            // You can disable specific rules that might be too strict
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
    // Configure backgrounds addon
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
    // Configure measure addon
    measure: {
      baseline: 8, // Set baseline grid to 8px
    },
    // Configure outline addon
    outline: {
      enabled: true,
      style: {
        // Customize outline styles
        border: "1px dashed rgba(0, 0, 0, 0.2)",
      },
    },
  },
  decorators: [
    // Add theme decorator
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    // Add a decorator to handle SCSS modules
    (Story) => (
      <div className="storybook-container">
        <ThemeProvider>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
