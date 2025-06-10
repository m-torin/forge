"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { SidebarNavigation } from "@repo/design-system/mantine-ciseco";

import type { TNavigationItem } from "@repo/design-system/mantine-ciseco/data/types";

interface SidebarNavigationWrapperProps {
  data: TNavigationItem[];
  onClose: () => void;
}

export function SidebarNavigationWrapper({
  data,
  onClose,
}: SidebarNavigationWrapperProps) {
  const pathname = usePathname();

  // Close the drawer when the pathname changes (navigation occurred)
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return <SidebarNavigation data={data} />;
}
