"use client";

import { useState, useEffect } from "react";
import { analytics } from "@repo/analytics-legacy";
import { type LayoutType } from "./types";
import { LayoutSwitcher } from "./layout-switcher";
import { StandardLayout } from "./layouts/standard";
import { GalleryLayout } from "./layouts/gallery";
import { MinimalLayout } from "./layouts/minimal";
import { ChildrenLayout } from "./layouts/children";
import { ShowcaseLayout } from "./layouts/showcase";

interface ClientWrapperProps {
  product: any;
  relatedProducts: any[];
  reviews: any[];
  dict: any;
  locale: string;
}

export function ClientWrapper({
  product,
  relatedProducts,
  reviews,
  dict,
  locale,
}: ClientWrapperProps) {
  const [layoutType, setLayoutType] = useState<LayoutType>("standard");

  // Track product view on mount
  useEffect(() => {
    if (product?.id) {
      analytics.capture("Product Viewed", {
        productId: product.id,
        productName: product.title || "",
        price: product.price || 0,
        category: "general",
        brand: "Your Brand Name",
        imageUrl: product.featuredImage?.src,
        locale,
        currency: "USD",
        value: product.price || 0,
        url: window.location.href,
      });
    }
  }, [product, locale]);

  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type);

    // Layout change tracking would go here if needed
    // For now, we're focusing on core analytics events
  };

  const layoutProps = {
    product,
    relatedProducts,
    reviews,
    dict,
    locale,
  };

  return (
    <>
      <LayoutSwitcher
        layoutType={layoutType}
        setLayoutType={handleLayoutChange}
      />
      {layoutType === "standard" && <StandardLayout {...layoutProps} />}
      {layoutType === "gallery" && <GalleryLayout {...layoutProps} />}
      {layoutType === "minimal" && <MinimalLayout {...layoutProps} />}
      {layoutType === "children" && <ChildrenLayout {...layoutProps} />}
      {layoutType === "showcase" && <ShowcaseLayout {...layoutProps} />}
    </>
  );
}
