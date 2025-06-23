import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BrandOrderByRelationAggregateInputSchema } from './BrandOrderByRelationAggregateInputSchema';
import { PdpJoinOrderByRelationAggregateInputSchema } from './PdpJoinOrderByRelationAggregateInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { JrFindReplaceRejectOrderByRelationAggregateInputSchema } from './JrFindReplaceRejectOrderByRelationAggregateInputSchema';
import { JollyRogerOrderByWithRelationInputSchema } from './JollyRogerOrderByWithRelationInputSchema';
import { ProductIdentifiersOrderByRelationAggregateInputSchema } from './ProductIdentifiersOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const BrandOrderByWithRelationInputSchema: z.ZodType<Prisma.BrandOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      baseUrl: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      parent: z.lazy(() => BrandOrderByWithRelationInputSchema).optional(),
      children: z.lazy(() => BrandOrderByRelationAggregateInputSchema).optional(),
      products: z.lazy(() => PdpJoinOrderByRelationAggregateInputSchema).optional(),
      collections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectOrderByRelationAggregateInputSchema)
        .optional(),
      jollyRoger: z.lazy(() => JollyRogerOrderByWithRelationInputSchema).optional(),
      identifiers: z.lazy(() => ProductIdentifiersOrderByRelationAggregateInputSchema).optional(),
      manufacturedProducts: z.lazy(() => PdpJoinOrderByRelationAggregateInputSchema).optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default BrandOrderByWithRelationInputSchema;
