import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumVoteTypeFilterSchema } from './NestedEnumVoteTypeFilterSchema';

export const NestedEnumVoteTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumVoteTypeWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => VoteTypeSchema).optional(),
      in: z
        .lazy(() => VoteTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => VoteTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => VoteTypeSchema),
          z.lazy(() => NestedEnumVoteTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumVoteTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumVoteTypeFilterSchema).optional(),
    })
    .strict();

export default NestedEnumVoteTypeWithAggregatesFilterSchema;
