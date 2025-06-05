"use client";

import { StandardLayout } from "./standard";

interface ShowcaseLayoutProps {
  product: any;
  relatedProducts: any[];
  reviews: any[];
  dict: any;
  locale: string;
}

export function ShowcaseLayout(props: ShowcaseLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement showcase-specific layout
  return <StandardLayout {...props} />;
}
