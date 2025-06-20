import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';

export const NestedEnumVoteTypeFilterSchema: z.ZodType<Prisma.NestedEnumVoteTypeFilter> = z.object({
  equals: z.lazy(() => VoteTypeSchema).optional(),
  in: z.lazy(() => VoteTypeSchema).array().optional(),
  notIn: z.lazy(() => VoteTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoteTypeSchema),z.lazy(() => NestedEnumVoteTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumVoteTypeFilterSchema;
