import { Thing, WithContext } from 'schema-dts';

// Common structured data types with better type safety
export type StructuredDataType =
  | 'Article'
  | 'BlogPosting'
  | 'BreadcrumbList'
  | 'Course'
  | 'Event'
  | 'FAQPage'
  | 'HowTo'
  | 'LocalBusiness'
  | 'Organization'
  | 'Person'
  | 'Product'
  | 'Recipe'
  | 'SoftwareApplication'
  | 'VideoObject'
  | 'WebSite';

// Helper function to create structured data with proper typing
export function createStructuredData<T extends Thing>(
  type: string,
  data: Omit<T, '@context' | '@type'>,
): WithContext<T> {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  } as unknown as WithContext<T>;
}

// Common structured data builders
export const structuredData = {
  article: (data: {
    author: string | { name: string; url?: string };
    dateModified?: string;
    datePublished: string;
    description?: string;
    headline: string;
    image?: string | string[];
    mainEntityOfPage?: string;
    publisher: {
      logo?: string;
      name: string;
    };
  }) =>
    createStructuredData('Article', {
      author:
        typeof data.author === 'string'
          ? { '@type': 'Person', name: data.author }
          : { '@type': 'Person', ...data.author },
      dateModified: data.dateModified ?? data.datePublished,
      datePublished: data.datePublished,
      description: data.description,
      headline: data.headline,
      image: data.image,
      mainEntityOfPage: data.mainEntityOfPage && {
        '@id': data.mainEntityOfPage,
        '@type': 'WebPage',
      },
      publisher: {
        '@type': 'Organization',
        name: data.publisher.name,
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
      itemListElement: items.map((item, index: any) => ({
        '@type': 'ListItem',
        item: item.url,
        name: item.name,
        position: index + 1,
      })),
    }),

  faq: (items: { answer: string; question: string }[]) =>
    createStructuredData('FAQPage', {
      mainEntity: items.map((item: any) => ({
        '@type': 'Question',
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
        name: item.question,
      })),
    }),

  organization: (data: {
    contactPoint?: {
      areaServed?: string | string[];
      availableLanguage?: string | string[];
      contactType: string;
      telephone: string;
    };
    description?: string;
    logo?: string;
    name: string;
    sameAs?: string[];
    url: string;
  }) =>
    createStructuredData('Organization', {
      description: data.description,
      logo: data.logo,
      name: data.name,
      sameAs: data.sameAs,
      url: data.url,
      ...(data.contactPoint && {
        contactPoint: {
          '@type': 'ContactPoint',
          ...data.contactPoint,
        },
      }),
    }),

  product: (data: {
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
    brand?: string;
    description?: string;
    image?: string | string[];
    name: string;
    offers?: {
      availability?: string;
      price: string;
      priceCurrency: string;
      seller?: string;
    };
  }) =>
    createStructuredData('Product', {
      description: data.description,
      image: data.image,
      name: data.name,
      ...(data.brand && {
        brand: {
          '@type': 'Brand',
          name: data.brand,
        },
      }),
      ...(data.offers && {
        offers: {
          '@type': 'Offer',
          availability: data.offers.availability ?? 'https://schema.org/InStock',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
          ...(data.offers.seller && {
            seller: {
              '@type': 'Organization',
              name: data.offers.seller,
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

  website: (data: {
    description?: string;
    name: string;
    potentialAction?: {
      queryInput: string;
      target: string;
    };
    url: string;
  }) =>
    createStructuredData('WebSite', {
      description: data.description,
      name: data.name,
      url: data.url,
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
};

// Enhanced JsonLd component with multiple schema support
interface JsonLdProps extends Record<string, any> {
  data: WithContext<Thing> | WithContext<Thing>[];
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index: any) => (
        <script
          key={id ? `${id}-${index}` : index}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
