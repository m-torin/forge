import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { FandomOrderByRelationAggregateInputSchema } from './FandomOrderByRelationAggregateInputSchema';
import { PdpJoinOrderByRelationAggregateInputSchema } from './PdpJoinOrderByRelationAggregateInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { JrFindReplaceRejectOrderByRelationAggregateInputSchema } from './JrFindReplaceRejectOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const LocationOrderByWithRelationInputSchema: z.ZodType<Prisma.LocationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  locationType: z.lazy(() => SortOrderSchema).optional(),
  lodgingType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isFictional: z.lazy(() => SortOrderSchema).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
  fandoms: z.lazy(() => FandomOrderByRelationAggregateInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinOrderByRelationAggregateInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectOrderByRelationAggregateInputSchema).optional(),
  deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export default LocationOrderByWithRelationInputSchema;
