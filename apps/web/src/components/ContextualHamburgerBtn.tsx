"use client";

import { HamburgerBtnMenu } from "@repo/design-system/mantine-ciseco";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function ContextualHamburgerBtn() {
  const { openNav } = useAppLayout();

  return <HamburgerBtnMenu onClick={openNav} />;
}
