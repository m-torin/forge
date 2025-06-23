import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { BrandOrderByWithRelationInputSchema } from './BrandOrderByWithRelationInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { LocationOrderByRelationAggregateInputSchema } from './LocationOrderByRelationAggregateInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { BrandOrderByRelationAggregateInputSchema } from './BrandOrderByRelationAggregateInputSchema';
import { ProductIdentifiersOrderByRelationAggregateInputSchema } from './ProductIdentifiersOrderByRelationAggregateInputSchema';
import { PdpUrlOrderByRelationAggregateInputSchema } from './PdpUrlOrderByRelationAggregateInputSchema';

export const PdpJoinOrderByWithRelationInputSchema: z.ZodType<Prisma.PdpJoinOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      productId: z.lazy(() => SortOrderSchema).optional(),
      brandId: z.lazy(() => SortOrderSchema).optional(),
      canonicalUrl: z.lazy(() => SortOrderSchema).optional(),
      iframeUrl: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      tempMediaUrls: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastScanned: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      brand: z.lazy(() => BrandOrderByWithRelationInputSchema).optional(),
      taxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
      locations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
      collections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      manufacturerBrands: z.lazy(() => BrandOrderByRelationAggregateInputSchema).optional(),
      identifiers: z.lazy(() => ProductIdentifiersOrderByRelationAggregateInputSchema).optional(),
      urls: z.lazy(() => PdpUrlOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default PdpJoinOrderByWithRelationInputSchema;
