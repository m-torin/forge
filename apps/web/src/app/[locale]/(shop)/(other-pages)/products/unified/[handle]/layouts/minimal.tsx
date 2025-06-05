"use client";

import { StandardLayout } from "./standard";

interface MinimalLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

export function MinimalLayout(props: MinimalLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement minimal-specific layout
  return <StandardLayout {...props} />;
}
