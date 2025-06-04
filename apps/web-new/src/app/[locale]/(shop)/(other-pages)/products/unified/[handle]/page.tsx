import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import { getDictionary } from '@/i18n'
import { JsonLd, structuredData } from '@repo/seo/structured-data'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ClientWrapper } from './client-wrapper'
import { type UnifiedPDPProps } from './types'

interface LocalizedUnifiedPDPProps extends UnifiedPDPProps {
  params: Promise<{ handle: string; locale: string }>
}

export async function generateMetadata({ params }: LocalizedUnifiedPDPProps): Promise<Metadata> {
  const { handle, locale } = await params
  const dict = await getDictionary(locale)
  const product = await getProductDetailByHandle(handle)
  
  if (!product.id) {
    return {
      title: dict.product.productNotFound,
      description: dict.product.productNotFoundDesc,
    }
  }

  const { title, description, featuredImage, price, status } = product
  const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/${locale}/products/unified/${handle}`
  
  return {
    title: title || dict.product.viewProduct,
    description: description || 'Product detail page',
    openGraph: {
      title: title || dict.product.viewProduct,
      description: description || 'Product detail page',
      url: productUrl,
      images: featuredImage?.src ? [
        {
          url: featuredImage.src,
          width: 800,
          height: 800,
          alt: featuredImage.alt || title || 'Product image',
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title || dict.product.viewProduct,
      description: description || 'Product detail page',
      images: featuredImage?.src ? [featuredImage.src] : [],
    },
    other: {
      // Pinterest Rich Pin meta tags
      'og:type': 'product',
      'product:price:amount': price?.toString() || '0',
      'product:price:currency': 'USD',
      'product:availability': status === dict.product.inStock ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:retailer_item_id': handle,
      'product:category': 'general',
      // Pinterest specific meta tags
      'pinterest-rich-pin': 'true',
      'pin:description': description || title || 'Product detail page',
      'pin:url': productUrl,
      'pin:media': featuredImage?.src || '',
    },
  }
}

export default async function UnifiedPDPPage({ params }: LocalizedUnifiedPDPProps) {
  const { handle, locale } = await params
  const dict = await getDictionary(locale)
  const product = await getProductDetailByHandle(handle)
  const relatedProducts = (await getProducts()).slice(2, 8)
  const reviews = await getProductReviews(handle)

  if (!product.id) {
    return notFound()
  }

  // Pinterest Rich Pin structured data
  const productStructuredData = structuredData.product({
    name: product.title || '',
    description: product.description || product.title || '',
    image: [
      product.featuredImage?.src,
      ...(product.images?.map((img: any) => img.src).filter(Boolean) || [])
    ].filter(Boolean),
    brand: 'Your Brand Name', // Replace with actual brand
    offers: {
      price: (product.price || 0).toString(),
      priceCurrency: 'USD',
      availability: product.status === dict.product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: 'Your Store Name' // Replace with actual seller name
    },
    aggregateRating: product.rating && product.reviewNumber ? {
      ratingValue: product.rating,
      reviewCount: product.reviewNumber
    } : undefined
  })

  return (
    <div>
      {/* Pinterest Rich Pin Structured Data */}
      <JsonLd data={productStructuredData} id={`product-${handle}`} />
      
      <ClientWrapper 
        product={product} 
        relatedProducts={relatedProducts} 
        reviews={reviews}
        dict={dict}
        locale={locale}
      />
    </div>
  )
}