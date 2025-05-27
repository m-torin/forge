import type { Thing, WithContext } from 'schema-dts';

// Common structured data types with better type safety
export type StructuredDataType =
  | 'WebSite'
  | 'Organization'
  | 'Person'
  | 'Article'
  | 'BlogPosting'
  | 'Product'
  | 'FAQPage'
  | 'HowTo'
  | 'Recipe'
  | 'Event'
  | 'Course'
  | 'LocalBusiness'
  | 'SoftwareApplication'
  | 'VideoObject'
  | 'BreadcrumbList';

// Helper function to create structured data with proper typing
export function createStructuredData<T extends Thing>(
  type: string,
  data: Omit<T, '@context' | '@type'>,
): WithContext<T> {
  return {
    '@type': type,
    '@context': 'https://schema.org',
    ...data,
  } as unknown as WithContext<T>;
}

// Common structured data builders
export const structuredData = {
  website: (data: {
    name: string;
    url: string;
    description?: string;
    potentialAction?: {
      target: string;
      queryInput: string;
    };
  }) =>
    createStructuredData('WebSite', {
      name: data.name,
      url: data.url,
      description: data.description,
      ...(data.potentialAction && {
        potentialAction: {
          '@type': 'SearchAction',
          'query-input': `required name=${data.potentialAction.queryInput}`,
          target: {
            '@type': 'EntryPoint',
            urlTemplate: data.potentialAction.target,
          },
        },
      }),
    }),

  organization: (data: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
    contactPoint?: {
      telephone: string;
      contactType: string;
      areaServed?: string | string[];
      availableLanguage?: string | string[];
    };
  }) =>
    createStructuredData('Organization', {
      name: data.name,
      url: data.url,
      description: data.description,
      logo: data.logo,
      sameAs: data.sameAs,
      ...(data.contactPoint && {
        contactPoint: {
          '@type': 'ContactPoint',
          ...data.contactPoint,
        },
      }),
    }),

  article: (data: {
    headline: string;
    description?: string;
    image?: string | string[];
    datePublished: string;
    dateModified?: string;
    author: string | { name: string; url?: string };
    publisher: {
      name: string;
      logo?: string;
    };
    mainEntityOfPage?: string;
  }) =>
    createStructuredData('Article', {
      author:
        typeof data.author === 'string'
          ? { name: data.author, '@type': 'Person' }
          : { '@type': 'Person', ...data.author },
      dateModified: data.dateModified || data.datePublished,
      datePublished: data.datePublished,
      description: data.description,
      headline: data.headline,
      image: data.image,
      mainEntityOfPage: data.mainEntityOfPage && {
        '@id': data.mainEntityOfPage,
        '@type': 'WebPage',
      },
      publisher: {
        name: data.publisher.name,
        '@type': 'Organization',
        ...(data.publisher.logo && {
          logo: {
            '@type': 'ImageObject',
            url: data.publisher.logo,
          },
        }),
      },
    }),

  breadcrumbs: (items: { name: string; url: string }[]) =>
    createStructuredData('BreadcrumbList', {
      itemListElement: items.map((item, index) => ({
        name: item.name,
        '@type': 'ListItem',
        item: item.url,
        position: index + 1,
      })),
    }),

  faq: (items: { question: string; answer: string }[]) =>
    createStructuredData('FAQPage', {
      mainEntity: items.map((item) => ({
        name: item.question,
        '@type': 'Question',
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),

  product: (data: {
    name: string;
    description?: string;
    image?: string | string[];
    brand?: string;
    offers?: {
      price: string;
      priceCurrency: string;
      availability?: string;
      seller?: string;
    };
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }) =>
    createStructuredData('Product', {
      name: data.name,
      description: data.description,
      image: data.image,
      ...(data.brand && {
        brand: {
          name: data.brand,
          '@type': 'Brand',
        },
      }),
      ...(data.offers && {
        offers: {
          '@type': 'Offer',
          availability: data.offers.availability || 'https://schema.org/InStock',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
          ...(data.offers.seller && {
            seller: {
              name: data.offers.seller,
              '@type': 'Organization',
            },
          }),
        },
      }),
      ...(data.aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.aggregateRating.ratingValue,
          reviewCount: data.aggregateRating.reviewCount,
        },
      }),
    }),
};

// Enhanced JsonLd component with multiple schema support
interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[];
  id?: string;
}

export function JsonLd({ id, data }: JsonLdProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={id ? `${id}-${index}` : index}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
