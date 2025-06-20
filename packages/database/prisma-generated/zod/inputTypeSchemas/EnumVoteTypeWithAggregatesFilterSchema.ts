import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';
import { NestedEnumVoteTypeWithAggregatesFilterSchema } from './NestedEnumVoteTypeWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumVoteTypeFilterSchema } from './NestedEnumVoteTypeFilterSchema';

export const EnumVoteTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumVoteTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => VoteTypeSchema).optional(),
  in: z.lazy(() => VoteTypeSchema).array().optional(),
  notIn: z.lazy(() => VoteTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => VoteTypeSchema),z.lazy(() => NestedEnumVoteTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumVoteTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumVoteTypeFilterSchema).optional()
}).strict();

export default EnumVoteTypeWithAggregatesFilterSchema;
