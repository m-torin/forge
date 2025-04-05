"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

import type { Theme } from "@clerk/types";
import type { ComponentProps } from "react";

export const AuthProvider = (
  properties: ComponentProps<typeof ClerkProvider>,
) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const baseTheme = isDark ? dark : undefined;

  const elements: Theme["elements"] = {
    dividerLine: "bg-border",
    navbarButton: "text-foreground",
    organizationPreview__organizationSwitcherTrigger: "gap-2",
    organizationPreviewAvatarContainer: "shrink-0",
    organizationPreviewMainIdentifier: "text-foreground",
    organizationSwitcherTrigger__open: "bg-background",
    organizationSwitcherTriggerIcon: "text-muted-foreground",
    socialButtonsIconButton: "bg-card",
  };

  return <ClerkProvider {...properties} appearance={{ baseTheme, elements }} />;
};
