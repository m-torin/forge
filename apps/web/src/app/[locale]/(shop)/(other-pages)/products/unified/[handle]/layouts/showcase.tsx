"use client";

import { StandardLayout } from "./standard";

interface ShowcaseLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

export function ShowcaseLayout(props: ShowcaseLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement showcase-specific layout
  return <StandardLayout {...props} />;
}
