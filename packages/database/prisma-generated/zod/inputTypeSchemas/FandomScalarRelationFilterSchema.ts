import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';

export const FandomScalarRelationFilterSchema: z.ZodType<Prisma.FandomScalarRelationFilter> = z
  .object({
    is: z.lazy(() => FandomWhereInputSchema).optional(),
    isNot: z.lazy(() => FandomWhereInputSchema).optional(),
  })
  .strict();

export default FandomScalarRelationFilterSchema;
