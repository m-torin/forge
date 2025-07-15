/**
 * Client-side SEO exports (non-Next.js)
 *
 * This file provides client-side SEO functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/seo/client/next' instead.
 */

import { Thing, WithContext } from 'schema-dts';

interface JsonLdProps extends Record<string, any> {
  data: WithContext<Thing> | WithContext<Thing>[];
  id?: string;
}

// JsonLd component for rendering structured data
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

// Re-export schema types for convenience
export * from 'schema-dts';
export type { Thing, WithContext } from 'schema-dts';
