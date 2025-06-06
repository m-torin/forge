"use client";

import { LikeSaveBtnsWithFavorites } from "@/components/LikeSaveBtnsWithFavorites";
import { useGuestActions } from "@/contexts/GuestActionsContext";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  PlayIcon,
  ShareIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Button, Select, Text } from "@mantine/core";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  AddToCardButton,
  FiveStartIconForRate,
  Heading,
  Label,
  NcInputNumber,
  Prices,
  ProductCard,
  ProductStatus,
} from "@repo/design-system/mantine-ciseco";

// Define local types
interface ProductVariant {
  id: string;
  image?: string;
  name: string;
  price: number;
}

interface ShowcaseLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

/**
 * Showcase Layout - Premium editorial-style presentation
 * Hero product display with storytelling elements
 */
export function ShowcaseLayout({
  dict,
  locale: _locale,
  product,
  relatedProducts,
  reviews,
}: ShowcaseLayoutProps) {
  const { activity } = useGuestActions();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [_selectedImage, _setSelectedImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Track product view
  useEffect(() => {
    activity.trackProductView({
      id: product.id,
      image: product.images?.[0]?.src,
      price: product.price,
      title: product.title,
      viewedAt: new Date(),
    });
  }, [product.id, activity, product.title, product.price, product.images]);

  const _currentPrice = selectedVariant?.price || product.price;
  const images = product.images || [];
  const hasVideo = product.video;

  return (
    <div className="showcase-layout">
      {/* Hero Section - Full viewport storytelling */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          {hasVideo && isPlaying ? (
            <video
              autoPlay
              loop
              className="w-full h-full object-cover"
              muted
              src={product.video}
            />
          ) : (
            images[0] && (
              <Image
                className="w-full h-full object-cover"
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src={images[0].src}
              />
            )
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container text-center text-white px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Category */}
            {product.category && (
              <p className="text-sm uppercase tracking-widest opacity-80">
                {product.category}
              </p>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight">
              {product.title}
            </h1>

            {/* Tagline */}
            {product.tagline && (
              <p className="text-xl md:text-2xl font-light opacity-90">
                {product.tagline}
              </p>
            )}

            {/* Play Video Button */}
            {hasVideo && !isPlaying && (
              <button
                onClick={() => setIsPlaying(true)}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <PlayIcon className="w-12 h-12 border border-white/50 rounded-full p-3" />
                <span>{dict.product?.watchVideo || "Watch Video"}</span>
              </button>
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDownIcon className="w-6 h-6 text-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Story Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Heading>{dict.product?.theStory || "The Story"}</Heading>

            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {product.story || product.description}
              </p>
            </div>

            {/* Key Features Grid */}
            {product.keyFeatures && (
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {product.keyFeatures.map((feature: any) => (
                  <div
                    key={feature.title || feature}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto text-neutral-400">
                      <StarIcon className="w-full h-full" />
                    </div>
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section - Lifestyle Images */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {images.slice(1, 5).map((image: any, index: number) => (
              <div
                key={image.src || index}
                onClick={() => _setSelectedImage(index + 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    _setSelectedImage(index + 1);
                  }
                }}
                role="button"
                className={`${
                  index === 0 ? "md:col-span-2" : ""
                } relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer group`}
                tabIndex={0}
              >
                <Image
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={image.alt || `${product.title} ${index + 2}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={image.src}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details & Purchase Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
            {/* Left: Product Details */}
            <div className="space-y-8">
              <div>
                <Heading>{dict.product?.details || "Details"}</Heading>

                <div className="mt-6 space-y-6">
                  {/* Materials */}
                  {product.materials && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        {dict.product?.materials || "Materials"}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {product.materials}
                      </p>
                    </div>
                  )}

                  {/* Dimensions */}
                  {product.dimensions && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        {dict.product?.dimensions || "Dimensions"}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {product.dimensions}
                      </p>
                    </div>
                  )}

                  {/* Care Instructions */}
                  {product.care && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        {dict.product?.care || "Care Instructions"}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {product.care}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sustainability */}
              {product.sustainability && (
                <div className="border-t pt-8">
                  <div className="flex items-start gap-4">
                    <StarIcon className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        {dict.product?.sustainability || "Sustainability"}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {product.sustainability}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Purchase Options - Sticky */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 space-y-6">
                {/* Price */}
                <div>
                  <Prices className="text-3xl" price={product.price} />
                  {product.status && (
                    <ProductStatus className="mt-2" status={product.status} />
                  )}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <FiveStartIconForRate defaultPoint={product.rating} />
                    <span className="text-sm text-neutral-500">
                      {product.rating} ({product.reviewCount}{" "}
                      {dict.product?.reviews || "reviews"})
                    </span>
                  </div>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 1 && (
                  <div>
                    <Label className="mb-3">
                      {dict.product?.selectOption || "Select Option"}
                    </Label>
                    <Select
                      onChange={(value) => {
                        const variant = product.variants.find(
                          (v: any) => v.id === value,
                        );
                        setSelectedVariant(variant);
                      }}
                      placeholder={
                        dict.product?.chooseVariant || "Choose variant"
                      }
                      data={product.variants.map((variant: any) => ({
                        label: variant.name,
                        value: variant.id,
                      }))}
                    />
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <Label className="mb-3">
                    {dict.product?.quantity || "Quantity"}
                  </Label>
                  <NcInputNumber
                    defaultValue={1}
                    max={product.stock || 99}
                    min={1}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3">
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

                  <div className="flex gap-3">
                    <LikeSaveBtnsWithFavorites
                      productId={product.id}
                      productName={product.title}
                    />
                    <Button className="flex-1" size="lg" variant="outline">
                      <ShareIcon className="w-4 h-4 mr-2" />
                      {dict.common?.share || "Share"}
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t pt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <TruckIcon className="w-5 h-5 text-neutral-500" />
                    <span>
                      {dict.product?.freeShipping || "Free shipping worldwide"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-neutral-500" />
                    <span>{dict.product?.warranty || "2-year warranty"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowPathIcon className="w-5 h-5 text-neutral-500" />
                    <span>{dict.product?.returns || "60-day returns"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews && reviews.length > 0 && (
        <section className="py-20 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="container">
            <Heading className="text-center mb-12">
              {dict.product?.whatCustomersSay || "What Customers Say"}
            </Heading>

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {reviews.slice(0, 3).map((review: any) => (
                  <div
                    key={review.id || review.author}
                    className="bg-white dark:bg-neutral-800 rounded-lg p-6"
                  >
                    <Text>{review.content}</Text>
                    <Text c="dimmed" mt="md" size="sm">
                      - {review.author}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Complete the Look */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <Heading>
                {dict.product?.completeTheLook || "Complete the Look"}
              </Heading>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                {dict.product?.curatedSelection ||
                  "Curated selection to complement your style"}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
