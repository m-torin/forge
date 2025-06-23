import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinScalarRelationFilterSchema: z.ZodType<Prisma.PdpJoinScalarRelationFilter> = z
  .object({
    is: z.lazy(() => PdpJoinWhereInputSchema).optional(),
    isNot: z.lazy(() => PdpJoinWhereInputSchema).optional(),
  })
  .strict();

export default PdpJoinScalarRelationFilterSchema;
