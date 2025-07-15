/**
 * Client-side SEO exports for Next.js
 *
 * This file provides client-side SEO functionality specifically for Next.js applications.
 */

'use client';

import Script from 'next/script';
import React, { Suspense, use } from 'react';
import { Thing, WithContext } from 'schema-dts';

interface JsonLdProps extends Record<string, any> {
  data: WithContext<Thing> | WithContext<Thing>[];
  id?: string;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive' | 'worker';
}

// JsonLd component for rendering structured data in Next.js
export function JsonLd({ data, id, strategy: strategy = 'afterInteractive' }: JsonLdProps) {
  void strategy; // explicitly mark as unused
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index: any) => (
        <script
          key={id ? `${id}-${index}` : index}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          type="application/ld+json"
          data-testid={id || `jsonld-script`}
        />
      ))}
    </>
  );
}

// Optimized JsonLd using Next.js Script component for better performance
export function OptimizedJsonLd({ data, id, strategy = 'afterInteractive' }: JsonLdProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index: any) => (
        <Script
          key={id ? `${id}-${index}` : index}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          id={id ? `${id}-${index}` : `jsonld-${index}`}
          strategy={strategy}
          type="application/ld+json"
          data-testid={id ? `${id}-${index}` : `optimized-jsonld-script`}
        />
      ))}
    </>
  );
}

// Streaming-compatible JsonLd component for React Server Components
interface StreamingJsonLdProps extends Record<string, any> {
  dataPromise: Promise<WithContext<Thing> | WithContext<Thing>[]>;
  id?: string;
  fallback?: WithContext<Thing>;
}

export function StreamingJsonLd({ dataPromise, id, fallback }: StreamingJsonLdProps) {
  return (
    <Suspense
      fallback={fallback ? <JsonLd data={fallback} id={id ? `${id}-0` : undefined} /> : null}
    >
      <StreamingJsonLdInner dataPromise={dataPromise} id={id} />
    </Suspense>
  );
}

function StreamingJsonLdInner({
  dataPromise,
  id,
}: {
  dataPromise: Promise<WithContext<Thing> | WithContext<Thing>[]>;
  id?: string;
}) {
  const data = use(dataPromise);
  return <JsonLd data={data} id={id} />;
}

// Hook for dynamic Open Graph preview
export function useOpenGraphPreview(metadata: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}) {
  const [preview, setPreview] = React.useState(metadata);

  const updatePreview = React.useCallback((updates: Partial<typeof metadata>) => {
    setPreview((prev: any) => ({ ...prev, ...updates }));
  }, []);

  const generatePreviewHtml = React.useCallback(() => {
    return `
      <meta property="og:title" content="${preview.title}" />
      <meta property="og:description" content="${preview.description}" />
      ${preview.image ? `<meta property="og:image" content="${preview.image}" />` : ''}
      ${preview.url ? `<meta property="og:url" content="${preview.url}" />` : ''}
    `;
  }, [preview]);

  return {
    preview,
    updatePreview,
    generatePreviewHtml,
  };
}

// Re-export schema types for convenience
export * from 'schema-dts';
export type { Thing, WithContext } from 'schema-dts';
