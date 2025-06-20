import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinNullableScalarRelationFilterSchema: z.ZodType<Prisma.PdpJoinNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => PdpJoinWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => PdpJoinWhereInputSchema).optional().nullable()
}).strict();

export default PdpJoinNullableScalarRelationFilterSchema;
