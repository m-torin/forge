"use client";

import { StandardLayout } from "./standard";

interface GalleryLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

export function GalleryLayout(props: GalleryLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement gallery-specific layout
  return <StandardLayout {...props} />;
}
