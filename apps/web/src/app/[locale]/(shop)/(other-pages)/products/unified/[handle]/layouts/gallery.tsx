"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { LikeSaveBtnsWithFavorites } from "@/components/LikeSaveBtnsWithFavorites";
import { useGuestActions } from "@/contexts/GuestActionsContext";
import { useEffect, useState } from "react";

import {
  AccordionInfo,
  AddToCardButton,
  BagIcon,
  Button,
  FiveStartIconForRate,
  Heading,
  Label,
  ListingImageGallery,
  NcInputNumber,
  Prices,
  ProductCard,
  ProductStatus,
  ReviewItem,
  VerifyIcon,
} from "@repo/design-system/mantine-ciseco";

// Define local types
interface ProductVariant {
  id: string;
  image?: string;
  name: string;
  price: number;
}

interface GalleryLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

/**
 * Gallery Layout - Full-width immersive image gallery
 * Images take center stage with minimal UI overlays
 */
export function GalleryLayout({
  dict,
  locale: _locale,
  product,
  relatedProducts,
  reviews,
}: GalleryLayoutProps) {
  const { activity } = useGuestActions();
  const [selectedVariant, _setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name);

  // Track product view
  useEffect(() => {
    activity.trackProductView({
      id: product.id,
      image: product.images?.[0]?.src,
      price: product.price,
      title: product.title,
      viewedAt: new Date(),
    });
  }, [product.id, product.images, product.price, product.title, activity]);

  const currentPrice = selectedVariant?.price || product.price;
  const images = product.images || [];

  return (
    <div className="nc-ProductDetailPage2">
      {/* Full-width gallery section */}
      <div className="relative">
        {/* Main Gallery - Takes full viewport */}
        <div className="h-screen sticky top-0">
          <ListingImageGallery images={images} />

          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <FavoriteButton
              productId={product.id}
              productName={product.title}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
              price={currentPrice}
            />
            <button className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white">
              <BagIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Info Overlay - Scrolls over gallery */}
        <div className="relative bg-white dark:bg-neutral-900 -mt-20 rounded-t-[40px] pt-8 pb-20">
          <div className="container">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16">
              {/* Left: Product Details */}
              <div className="space-y-8">
                {/* Title and Price */}
                <div>
                  <Heading>{product.title}</Heading>

                  <div className="mt-4 flex items-center gap-4">
                    <Prices className="text-2xl" price={product.price} />
                    {product.status && (
                      <ProductStatus status={product.status} />
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="mt-4 flex items-center gap-2">
                      <FiveStartIconForRate defaultPoint={product.rating} />
                      <span className="text-sm text-neutral-500">
                        {product.rating} ({product.reviewCount}{" "}
                        {dict.product?.reviews || "reviews"})
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-sm dark:prose-invert">
                  <p>{product.description}</p>
                </div>

                {/* Features */}
                {product.features && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {dict.product?.features || "Features"}
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature: string) => (
                        <li key={feature} className="flex items-start gap-2">
                          <VerifyIcon className="w-5 h-5 mt-0.5 text-green-500" />
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right: Purchase Options */}
              <div className="mt-8 lg:mt-0 space-y-6 lg:sticky lg:top-24 lg:h-fit">
                {/* Variants */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <Label>{dict.product?.color || "Color"}</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.colors.map((color: any) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-10 h-10 rounded-full border-2 ${
                            selectedColor === color.name
                              ? "border-neutral-900 dark:border-white"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <Label>{dict.product?.size || "Size"}</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.sizes.map((size: string) => (
                        <Button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          size="sm"
                          variant={selectedSize === size ? "filled" : "outline"}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label>{dict.product?.quantity || "Quantity"}</Label>
                    <NcInputNumber
                      className="w-32"
                      defaultValue={1}
                      max={product.stock || 99}
                      min={1}
                    />
                  </div>

                  <AddToCardButton
                    className="w-full"
                    imageUrl={product.images?.[0]?.src || ""}
                    price={product.price || 0}
                    quantity={1}
                    size="lg"
                    title={product.title}
                  >
                    {dict.product?.addToCart || "Add to Cart"}
                  </AddToCardButton>

                  <LikeSaveBtnsWithFavorites
                    productId={product.id}
                    productName={product.title}
                  />
                </div>

                {/* Additional Info */}
                <div className="border-t pt-6 space-y-4">
                  <AccordionInfo
                    data={[
                      {
                        name: dict.product?.shipping || "Shipping & Returns",
                        content:
                          "Free shipping on orders over $50. Easy 30-day returns.",
                      },
                      {
                        name: dict.product?.materials || "Materials & Care",
                        content:
                          product.materials ||
                          "Premium materials. Machine washable.",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="container py-16">
          <Heading className="mb-8">
            {dict.product?.customerReviews || "Customer Reviews"}
          </Heading>
          <div className="grid gap-6 lg:grid-cols-2">
            {reviews.map((review: any) => (
              <ReviewItem key={review.id || review.author} data={review} />
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="container py-16">
          <Heading className="mb-8">
            {dict.product?.youMayAlsoLike || "You May Also Like"}
          </Heading>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} data={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
