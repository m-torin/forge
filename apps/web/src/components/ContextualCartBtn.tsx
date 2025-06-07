"use client";

import { useAppLayout } from "@/contexts/AppLayoutContext";

import { CartBtn } from "@repo/design-system/mantine-ciseco";

interface ContextualCartBtnProps {
  numberItems?: number;
}

export default function ContextualCartBtn({
  numberItems = 0,
}: ContextualCartBtnProps) {
  const { openCart } = useAppLayout();

  return <CartBtn onClick={openCart} numberItems={numberItems} />;
}
