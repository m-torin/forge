import { getDictionary } from '@/i18n';
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data-service';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OptimizedJsonLd } from '@repo/seo/client/next';
import { structuredData } from '@repo/seo/server/next';

import { ClientWrapper } from './client-wrapper';
import { type UnifiedPDPProps } from './types';

interface LocalizedUnifiedPDPProps extends UnifiedPDPProps {
  params: Promise<{ handle: string; locale: string }>;
}

export async function generateMetadata({ params }: LocalizedUnifiedPDPProps): Promise<Metadata> {
  const { handle, locale } = await params;
  const dict = await getDictionary(locale);
  const product = await getProductDetailByHandle(handle);

  if (!product.id) {
    return {
      description: dict.product.productNotFoundDesc,
      title: dict.product.productNotFound,
    };
  }

  const { description, featuredImage, price, status, title } = product;
  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/${locale}/products/unified/${handle}`;

  return {
    description: description || 'Product detail page',
    openGraph: {
      type: 'website',
      url: productUrl,
      description: description || 'Product detail page',
      images: featuredImage?.src
        ? [
            {
              width: 800,
              url: featuredImage.src,
              alt: featuredImage.alt || title || 'Product image',
              height: 800,
            },
          ]
        : [],
      title: title || dict.product.viewProduct,
    },
    other: {
      'product:retailer_item_id': handle,
      // Pinterest Rich Pin meta tags
      'og:type': 'product',
      'pin:url': productUrl,
      'pin:description': description || title || 'Product detail page',
      'pin:media': featuredImage?.src || '',
      // Pinterest specific meta tags
      'pinterest-rich-pin': 'true',
      'product:availability': status === dict.product.inStock ? 'in stock' : 'out of stock',
      'product:category': 'general',
      'product:condition': 'new',
      'product:price:amount': price?.toString() || '0',
      'product:price:currency': 'USD',
    },
    title: title || dict.product.viewProduct,
    twitter: {
      card: 'summary_large_image',
      description: description || 'Product detail page',
      images: featuredImage?.src ? [featuredImage.src] : [],
      title: title || dict.product.viewProduct,
    },
  };
}

export default async function UnifiedPDPPage({ params }: LocalizedUnifiedPDPProps) {
  const { handle, locale } = await params;
  const dict = await getDictionary(locale);
  const product = await getProductDetailByHandle(handle);
  const relatedProducts = (await getProducts()).slice(2, 8);
  const reviews = await getProductReviews(handle);

  if (!product.id) {
    return notFound();
  }

  // Pinterest Rich Pin structured data
  const productStructuredData = structuredData.product({
    name: product.title || '',
    aggregateRating:
      product.rating && product.reviewNumber
        ? {
            ratingValue: product.rating,
            reviewCount: product.reviewNumber,
          }
        : undefined,
    brand: 'Your Brand Name', // Replace with actual brand
    description: product.description || product.title || '',
    image: [
      product.featuredImage?.src,
      ...(product.images?.map((img: any) => img.src).filter(Boolean) || []),
    ].filter(Boolean),
    offers: {
      availability:
        product.status === dict.product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      price: (product.price || 0).toString(),
      priceCurrency: 'USD',
      seller: 'Your Store Name', // Replace with actual seller name
    },
  });

  return (
    <div>
      {/* Pinterest Rich Pin Structured Data */}
      <OptimizedJsonLd
        id={`product-${handle}`}
        data={productStructuredData}
        strategy="afterInteractive"
      />

      <ClientWrapper
        locale={locale}
        product={product}
        relatedProducts={relatedProducts}
        dict={dict}
        reviews={reviews}
      />
    </div>
  );
}
