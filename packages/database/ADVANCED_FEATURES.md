# Advanced Prisma Schema Features Guide

This guide explains how to use the advanced PostgreSQL features implemented in our Prisma schema.

## Table of Contents

1. [Overview](#overview)
2. [PostgreSQL Extensions Setup](#postgresql-extensions-setup)
3. [Full-Text Search with Trigram Indexes](#full-text-search-with-trigram-indexes)
4. [Computed Fields](#computed-fields)
5. [Database Views](#database-views)
6. [Prisma Preview Features](#prisma-preview-features)
7. [Prisma Client Extensions](#prisma-client-extensions)
8. [Advanced Usage Examples](#advanced-usage-examples)
9. [Troubleshooting](#troubleshooting)

## Overview

Our Prisma schema leverages advanced PostgreSQL features to enhance performance, functionality, and developer experience:

- **PostgreSQL Extensions**: Using powerful extensions like `pg_trgm` for text similarity searches
- **Full-Text Search**: Advanced indexing with Gin trigram operators for fuzzy search capabilities
- **Computed Fields**: Database-level computed columns for real-time analytics
- **Database Views**: Pre-aggregated and optimized data access for complex queries

## PostgreSQL Extensions Setup

### 1. Enable Extensions in Prisma Schema

The schema already includes:

```prisma
datasource db {
    provider     = "postgresql"
    url          = env("DATABASE_URL")
    relationMode = "foreignKeys"
    extensions   = [pgcrypto, pg_trgm, fuzzystrmatch]
}

generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["fullTextSearchPostgres", "postgresqlExtensions"]
}
```

### 2. Install Extensions on PostgreSQL Server

If you're using a managed PostgreSQL service (e.g., RDS, Supabase), ensure these extensions are enabled. On a self-hosted PostgreSQL server:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
```

### 3. Apply Migrations

Run Prisma migrations to ensure extensions are applied:

```bash
npx prisma migrate dev --name add-postgres-extensions
```

## Full-Text Search with Trigram Indexes

### How It Works

Trigram indexes break text into three-character chunks for fuzzy matching. For example, "hello" becomes "hel", "ell", "llo".

### Usage

```typescript
// Search for "hobbit" with typo tolerance (e.g., will match "hobit")
const results = await prisma.product.findMany({
  where: {
    OR: [
      { name: { search: "hobit" } }, 
      { fullMarkdown: { search: "hobit" } }
    ]
  }
});

// More powerful search with weights (field importance)
const results = await prisma.$queryRaw`
  SELECT 
    id, 
    name, 
    ts_rank(
      to_tsvector('english', name), 
      plainto_tsquery('english', 'hobit')
    ) * 2.0 + 
    ts_rank(
      to_tsvector('english', full_markdown), 
      plainto_tsquery('english', 'hobit')
    ) AS rank
  FROM products
  WHERE 
    name % 'hobit' OR
    full_markdown % 'hobit'
  ORDER BY rank DESC
  LIMIT 10;
`;
```

### Configuration Options

- Use `@@index([field(ops: raw("gin_trgm_ops"))], type: Gin)` for fuzzy text search
- For more precise control, use raw SQL with PostgreSQL's `%` operator for similarity

## Computed Fields

### How It Works

Computed fields are calculated at the database level using SQL expressions:

```prisma
discountPercent Decimal? @default(dbgenerated("CASE WHEN price_high > 0 AND price_sale > 0 THEN ((price_high - price_sale) / price_high * 100) ELSE NULL END"))
```

### Usage

```typescript
// Find products with at least 20% discount
const discountedProducts = await prisma.productSellerBrand.findMany({
  where: {
    discountPercent: { gte: 20 }
  },
  orderBy: {
    discountPercent: 'desc'
  }
});

// Find products with at least 30% profit margin
const highProfitProducts = await prisma.productSellerBrand.findMany({
  where: {
    profitMargin: { gte: 30 }
  }
});
```

### Adding New Computed Fields

1. Identify the calculation logic
2. Express it as a SQL CASE statement or function
3. Add to schema using `@default(dbgenerated("..."))`
4. Run `prisma migrate` to apply changes

## Database Views

### Setup Process

Our schema includes two views: `ProductPricingView` and `StoryStatsView`. To create these views in your database:

1. Create a new migration file:

```bash
npx prisma migrate dev --create-only --name add-database-views
```

2. Edit the migration file to include the SQL for creating views:

```sql
-- CreateView
CREATE VIEW product_pricing_view AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.slug AS product_slug,
    p.category_id,
    pc.name AS category_name,
    psb.seller_id,
    b.name AS seller_name,
    psb.relation_type,
    psb.price_high,
    psb.price_sale,
    psb.discount_percent,
    psb.is_available,
    psb.sku,
    pv.publisher_id,
    pb.name AS publisher_name
FROM 
    products p
JOIN 
    product_seller_brands psb ON p.id = psb.product_id
JOIN 
    brands b ON psb.seller_id = b.id
LEFT JOIN 
    product_categories pc ON p.category_id = pc.id
LEFT JOIN 
    product_variants pv ON pv.product_id = p.id
LEFT JOIN 
    brands pb ON pv.publisher_id = pb.id;

-- CreateView
CREATE VIEW story_stats_view AS
SELECT 
    s.id AS story_id,
    s.name AS story_name,
    s.slug AS story_slug,
    s.fandom_id,
    f.name AS fandom_name,
    COUNT(DISTINCT p.id) AS product_count,
    COUNT(DISTINCT psb.seller_id) AS seller_count,
    COUNT(DISTINCT pv.id) AS variant_count,
    COUNT(DISTINCT url.id) AS total_links,
    MIN(psb.price_sale) AS min_price,
    MAX(psb.price_sale) AS max_price,
    AVG(psb.price_sale) AS avg_price,
    s.updated_at
FROM 
    stories s
LEFT JOIN 
    fandoms f ON s.fandom_id = f.id
LEFT JOIN 
    products p ON p.id IN (
        SELECT product_id 
        FROM _ProductToStory 
        WHERE story_id = s.id
    )
LEFT JOIN 
    product_variants pv ON p.id = pv.product_id
LEFT JOIN 
    product_seller_brands psb ON p.id = psb.product_id
LEFT JOIN 
    url_registry url ON (
        url.entity_type = 'STORY' AND url.entity_id = s.id
    )
GROUP BY 
    s.id, s.name, s.slug, s.fandom_id, f.name, s.updated_at;
```

3. Apply the migration:

```bash
npx prisma migrate dev
```

### Usage

```typescript
// Using the ProductPricingView
const productPricing = await prisma.productPricingView.findMany({
  where: { 
    categoryName: "Fantasy",
    isAvailable: true 
  },
  orderBy: { 
    priceSale: 'asc' 
  },
  take: 10
});

// Using the StoryStatsView
const storyStats = await prisma.storyStatsView.findMany({
  where: {
    fandomName: "Harry Potter"
  },
  orderBy: {
    productCount: 'desc'
  }
});

// Getting detailed stats for a specific story
const harryPotterStats = await prisma.storyStatsView.findUnique({
  where: {
    storyId: 1 // Harry Potter story ID
  }
});
console.log(`Story: ${harryPotterStats.storyName}`);
console.log(`Products: ${harryPotterStats.productCount}`);
console.log(`Price range: $${harryPotterStats.minPrice} - $${harryPotterStats.maxPrice}`);
console.log(`Average price: $${harryPotterStats.avgPrice}`);
```

## Prisma Preview Features

Our project leverages several Prisma preview features to enhance database capabilities:

### fullTextSearchPostgres

Enables powerful full-text search capabilities in PostgreSQL.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}
```

#### Usage Example

```typescript
// Enhanced search using fullTextSearchPostgres
async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { search: query, mode: 'insensitive' } },
        { fullMarkdown: { search: query, mode: 'insensitive' } },
        { previewCopy: { search: query, mode: 'insensitive' } }
      ]
    },
    include: {
      category: true,
      sellerRelationships: { include: { seller: true }, take: 3 }
    }
  });
}
```

### postgresqlExtensions

Allows representation of PostgreSQL extensions in your Prisma schema.

```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  extensions   = [pgcrypto, pg_trgm, fuzzystrmatch]
}
```

### views

Enables using database views in your Prisma schema.

```prisma
/// @view
model ProductPricingView {
  productId      Int      @map("product_id")
  productName    String   @map("product_name")
  productSlug    String   @map("product_slug")
  categoryId     Int      @map("category_id")
  categoryName   String?  @map("category_name")
  sellerId       Int      @map("seller_id")
  sellerName     String   @map("seller_name")
  relationType   String   @map("relation_type")
  priceHigh      Decimal  @map("price_high")
  priceSale      Decimal  @map("price_sale")
  discountPercent Decimal? @map("discount_percent")
  isAvailable    Boolean  @map("is_available")
  sku            String?
  publisherId    Int?     @map("publisher_id")
  publisherName  String?  @map("publisher_name")

  @@map("product_pricing_view")
  @@id([productId, sellerId])
}
```

### multiSchema

Adds support for multiple schemas in a PostgreSQL database.

```prisma
model AnalyticsEvent {
  id        Int      @id @default(autoincrement())
  eventType String   @map("event_type")
  userId    String?  @map("user_id")
  timestamp DateTime @default(now())
  
  @@map("events")
  @@schema("analytics")
}
```

### relationJoins

Improves query performance for related records by optimizing the generated SQL.

```typescript
// This query will use more efficient joins with the relationJoins preview feature
const result = await prisma.product.findMany({
  where: {
    category: {
      slug: 'fantasy-books'
    }
  },
  include: {
    sellerRelationships: {
      include: {
        seller: true
      }
    }
  }
});
```

### nativeDistinct

Optimizes distinct queries by pushing the DISTINCT operation to the database level rather than handling it in Prisma's query engine.

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["nativeDistinct"]
}
```

#### Usage Example

```typescript
// Get one product from each category (efficient database-level distinct)
const distinctCategoryProducts = await prisma.product.findMany({
  where: {
    isAvailable: true
  },
  distinct: ['categoryId'],
  include: {
    category: true
  },
  orderBy: {
    name: 'asc'
  }
});

// Get distinct sellers for a specific product type
const distinctSellers = await prisma.productSellerBrand.findMany({
  where: {
    product: {
      categoryId: 5 // e.g., Fantasy Books
    }
  },
  distinct: ['sellerId'],
  include: {
    seller: true
  }
});
```

## Prisma Client Extensions

These extensions enhance Prisma Client with additional functionality:

### Extension Setup

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { withCache } from 'prisma-extension-caching'
import { withRandom } from 'prisma-extension-random'
import { withPagination } from 'prisma-paginate'

// Create client with extensions
const prisma = new PrismaClient()
  .$extends(withAccelerate())
  .$extends(withCache({
    models: {
      Product: {
        ttl: 300, // 5 minutes
        excludeMethods: ['create', 'update', 'delete']
      }
    }
  }))
  .$extends(withRandom())
  .$extends(withPagination());

export default prisma;
```

### @prisma/extension-accelerate

Official Prisma extension for global database caching.

```typescript
// Accelerate automatically caches read queries
const categories = await prisma.productCategory.findMany({
  orderBy: { name: 'asc' }
});

// Query will be served from cache if called again within TTL period
```

### prisma-extension-caching

Adds ability to cache complex queries.

```typescript
// The prisma-extension-caching extension will automatically cache this query
const products = await prisma.product.findMany({
  where: { categoryId: 1 },
  include: { 
    category: true,
    sellerRelationships: true 
  }
});

// Cached queries can be invalidated when data changes
await prisma.product.create({
  data: { /* product data */ }
}); // This will invalidate Product caches
```

### prisma-extension-random

Lets you query for random rows in your database.

```typescript
// Get random featured products for homepage
const featuredProducts = await prisma.product.findRandom({
  where: { 
    category: { slug: 'featured' },
    sellerRelationships: { some: { isAvailable: true } }
  },
  take: 4
});
```

### prisma-paginate

Adds support for paginating read queries.

```typescript
// Get paginated products with the pagination extension
const { data, meta } = await prisma.product.paginate({
  where: { categoryId: 5 },
  include: {
    category: true,
    sellerRelationships: {
      where: { isAvailable: true },
      include: { seller: true },
      take: 1
    }
  },
  orderBy: { name: 'asc' },
  perPage: 20,
  page: 1
});

console.log(`Showing ${data.length} of ${meta.total} results`);
console.log(`Page ${meta.currentPage} of ${meta.lastPage}`);
```

## Advanced Usage Examples

### 1. Product Search and Recommendation System

This example combines full-text search, database views, and the random extension:

```typescript
async function searchAndRecommend(searchTerm: string) {
  // Search for products using full-text search
  const searchResults = await prisma.product.findMany({
    where: {
      OR: [
        { name: { search: searchTerm, mode: 'insensitive' } },
        { fullMarkdown: { search: searchTerm, mode: 'insensitive' } }
      ]
    },
    include: {
      category: true,
      canonicalUrl: true
    },
    take: 10
  });
  
  // Get category of first search result (if any)
  const categoryId = searchResults[0]?.categoryId;
  
  // Get related random products from the same category
  const recommendations = categoryId 
    ? await prisma.product.findRandom({
        where: {
          categoryId,
          id: { notIn: searchResults.map(p => p.id) }
        },
        include: {
          category: true,
          sellerRelationships: {
            where: { isAvailable: true },
            include: { seller: true },
            take: 1
          }
        },
        take: 4
      })
    : [];
    
  // Get pricing information from the view
  const pricing = searchResults.length 
    ? await prisma.productPricingView.findMany({
        where: {
          productId: { in: searchResults.map(p => p.id) },
          isAvailable: true
        },
        orderBy: { priceSale: 'asc' }
      })
    : [];
    
  return {
    searchResults,
    recommendations,
    pricing,
    similarProducts: [], // Could add more recommendations here
  };
}
```

### 2. Advanced E-commerce Dashboard Using Multiple Features

```typescript
async function generateDashboardData() {
  // Use database views for performance metrics
  const topStories = await prisma.storyStatsView.findMany({
    orderBy: { productCount: 'desc' },
    take: 5
  });
  
  // Use computed fields for discount analysis
  const bestDeals = await prisma.productSellerBrand.findMany({
    where: {
      discountPercent: { gte: 25 },
      isAvailable: true
    },
    orderBy: { discountPercent: 'desc' },
    take: 5,
    include: {
      product: true,
      seller: true
    }
  });
  
  // Use pagination for recent products
  const { data: recentProducts } = await prisma.product.paginate({
    orderBy: { createdAt: 'desc' },
    perPage: 10,
    page: 1
  });
  
  // Use search for trending terms
  const searchAnalytics = await prisma.$queryRaw`
    SELECT 
      query, 
      COUNT(*) as search_count
    FROM analytics.search_events
    WHERE searched_at > NOW() - INTERVAL '7 days'
    GROUP BY query
    ORDER BY search_count DESC
    LIMIT 10
  `;
  
  return {
    topStories,
    bestDeals,
    recentProducts,
    searchAnalytics,
    timestamp: new Date()
  };
}
```

### 3. Advanced Search with Typo Tolerance

```typescript
export async function searchProducts(searchTerm: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { search: searchTerm } },
        { fullMarkdown: { search: searchTerm } },
        { previewCopy: { search: searchTerm } }
      ]
    },
    include: {
      category: true,
      canonicalUrl: true
    },
    take: 25
  });
}
```

### 2. Finding Best Deals Using Computed Fields

```typescript
export async function findBestDeals(categorySlug: string, minDiscountPercent = 20) {
  const category = await prisma.productCategory.findUnique({
    where: { slug: categorySlug }
  });
  
  if (!category) return [];
  
  return prisma.productSellerBrand.findMany({
    where: {
      product: {
        categoryId: category.id
      },
      discountPercent: { gte: minDiscountPercent },
      isAvailable: true
    },
    orderBy: {
      discountPercent: 'desc'
    },
    include: {
      product: true,
      seller: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    take: 10
  });
}
```

### 3. Aggregated Analytics via Views

```typescript
export async function getStoryPerformanceReport() {
  return prisma.storyStatsView.findMany({
    where: {
      productCount: { gt: 0 }
    },
    orderBy: [
      { productCount: 'desc' },
      { avgPrice: 'desc' }
    ],
    take: 20
  });
}

export async function getProductPricingComparison(productSlug: string) {
  return prisma.productPricingView.findMany({
    where: {
      productSlug
    },
    orderBy: {
      priceSale: 'asc'
    }
  });
}
```

## Troubleshooting

### Common Issues

#### 1. Extensions Not Available

**Error**: `Error: Extension "pg_trgm" was not found`

**Solution**: Ensure your PostgreSQL server has the extensions installed. For hosted services, check their documentation on enabling extensions.

#### 2. Search Not Working Correctly

**Problem**: Search not returning expected results or not tolerating typos

**Solution**: 
- Ensure you're using the correct search syntax with Prisma
- Verify the Gin indexes are properly created in the database
- For more control, use raw SQL to leverage PostgreSQL's full text search capabilities

#### 3. View Access Issues

**Error**: `Error: Table "product_pricing_view" not found`

**Solution**:
- Make sure the views were created successfully with the migration
- Check the view definition in the database
- Ensure your database user has SELECT permissions on the views

#### 4. Computed Fields Not Updating

**Problem**: Computed fields like `discountPercent` are not updating when related fields change

**Solution**:
- Remember that computed fields are only calculated when a record is inserted or updated
- Update the `priceHigh` or `priceSale` fields to trigger recalculation
- If needed, run a database update query to refresh all values

### Validation Queries

To validate your setup is working correctly, run these queries:

```sql
-- Check if extensions are installed
SELECT * FROM pg_extension WHERE extname IN ('pg_trgm', 'pgcrypto', 'fuzzystrmatch');

-- Check if views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' AND 
table_name IN ('product_pricing_view', 'story_stats_view');

-- Test trigram similarity
SELECT similarity('hobbit', 'hobit');

-- Should return a value between 0 and 1 (e.g., 0.833333)
```

For more help, consult the PostgreSQL documentation or our internal team resources.
