'use client';

import { FavoriteButton } from '@/components/guest/FavoriteButton';
import { useGuestActions } from '@/react/GuestActionsContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { CartBtn, Link, Prices } from '@/components/ui';

// Define local types
interface ProductVariant {
  id: string;
  image?: string;
  name: string;
  price: number;
}

interface MinimalLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

/**
 * Minimal Layout - Clean, distraction-free design
 * Focus on essential information with maximum whitespace
 */
export function MinimalLayout({
  dict,
  locale: _locale,
  product,
  relatedProducts,
  reviews: _reviews,
}: MinimalLayoutProps) {
  const { activity } = useGuestActions();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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

  const currentPrice = selectedVariant?.price || product.price;
  const images = product.images || [];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Minimal Header */}
      <div className="container py-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500">
            ← {dict.common?.back || 'Back'}
          </Link>
          <div className="flex items-center gap-4">
            <FavoriteButton
              productId={product.id}
              productName={product.title}
              price={currentPrice}
            />
            <CartBtn />
          </div>
        </nav>
      </div>

      {/* Main Content - Centered and Minimal */}
      <div className="container max-w-5xl mx-auto pb-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Single Image Focus */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
              {images[selectedImage] && (
                <Image
                  className="w-full h-full object-cover"
                  alt={images[selectedImage].alt || product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={images[selectedImage].src}
                />
              )}
            </div>

            {/* Thumbnails - Minimal dots */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={image.src || index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === index
                        ? 'w-8 bg-neutral-900 dark:bg-white'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Essential Info Only */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Title and Price - Large and Clear */}
            <div className="space-y-4">
              <h1 className="text-4xl font-light tracking-tight">{product.title}</h1>

              <div className="text-3xl font-light">
                <Prices className="text-inherit" price={product.price} />
              </div>
            </div>

            {/* Simple Description */}
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>

            {/* Minimal Variant Selection */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-4">
                <select
                  onChange={(e) => {
                    const variant = product.variants.find((v: any) => v.id === e.target.value);
                    setSelectedVariant(variant);
                  }}
                  className="w-full px-4 py-3 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                >
                  <option value="">{dict.product?.selectOption || 'Select Option'}</option>
                  {product.variants.map((variant: any) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Simple Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-neutral-500">
                  {dict.product?.quantity || 'Quantity'}
                </label>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity">
                {dict.product?.addToCart || 'Add to Cart'}
              </button>
            </div>

            {/* Minimal Additional Info */}
            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700 space-y-2 text-sm text-neutral-500">
              <p>✓ {dict.product?.freeShipping || 'Free shipping on orders over $50'}</p>
              <p>✓ {dict.product?.easyReturns || '30-day easy returns'}</p>
              <p>✓ {dict.product?.securePayment || 'Secure payment'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          <div className="container py-16">
            <h2 className="text-2xl font-light text-center mb-12">
              {dict.product?.similarItems || 'Similar Items'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map((item: any) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden mb-4">
                    <Image
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      src={item.image}
                    />
                  </div>
                  <h3 className="text-sm">{item.title}</h3>
                  <p className="text-sm text-neutral-500">${item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
