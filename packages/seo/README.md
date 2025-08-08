# @repo/seo

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Utilities**: `./metadata`, `./structured-data`, `./sitemap`

- _AI Hints:_

  ```typescript
  // Primary: Next.js 15 metadata + structured data + sitemap generation
  import {
    createMetadata,
    metadataTemplates,
    structuredData
  } from "@repo/seo/server/next";
  // Components: import { JsonLd } from "@repo/seo/structured-data"
  // ❌ NEVER: Generate metadata in client components or ignore meta limits
  ```

- _Key Features:_
  - **Next.js 15 Metadata API**: Full integration with App Router metadata
    system
  - **Structured Data**: JSON-LD generation for products, organizations,
    articles with Schema.org markup
  - **Open Graph & Twitter Cards**: Rich social media previews with proper image
    optimization
  - **Sitemap Generation**: Automated XML sitemaps with priority, frequency,
    images, and videos
  - **Internationalization**: Multi-language SEO with hreflang support and
    localized content
  - **SEO Manager**: Centralized configuration for consistent metadata across
    applications

- _Metadata Templates:_

  ```typescript
  // Product page metadata
  return metadataTemplates.product({
    name: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: product.image,
    availability: product.stock > 0 ? "InStock" : "OutOfStock"
  });

  // Article metadata
  return metadataTemplates.article({
    title: post.title,
    description: post.excerpt,
    author: post.author.name,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt
  });
  ```

- _Structured Data:_

  ```typescript
  // JSON-LD components
  import { JsonLd } from "@repo/seo/structured-data";
  import { structuredData } from "@repo/seo/server/next";

  const productSchema = structuredData.product({ name, description, offers: { price, priceCurrency: 'USD' } });
  const orgSchema = structuredData.organization({ name, url, description });
  const articleSchema = structuredData.article({ headline, author, datePublished });

  return <><JsonLd data={productSchema} /><main>{content}</main></>;
  ```

- _Dynamic Sitemaps:_

  ```typescript
  // app/sitemap.ts
  import { generateSitemapObject } from "@repo/seo/server/next";

  export default async function sitemap() {
    const products = await getAllProducts();
    return generateSitemapObject([
      { url: baseUrl, changeFrequency: "daily", priority: 1 },
      ...products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8
      }))
    ]);
  }
  ```

- _Documentation:_ **[SEO Package](../../apps/docs/packages/seo.mdx)**
