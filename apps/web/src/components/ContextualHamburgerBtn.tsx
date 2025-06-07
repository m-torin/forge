"use client";

import { useAppLayout } from "@/contexts/AppLayoutContext";

import { HamburgerBtnMenu } from "@repo/design-system/mantine-ciseco";

export default function ContextualHamburgerBtn() {
  const { openNav } = useAppLayout();

  return <HamburgerBtnMenu onClick={openNav} />;
}
