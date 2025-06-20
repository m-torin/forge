import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const TwoFactorScalarRelationFilterSchema: z.ZodType<Prisma.TwoFactorScalarRelationFilter> = z.object({
  is: z.lazy(() => TwoFactorWhereInputSchema).optional(),
  isNot: z.lazy(() => TwoFactorWhereInputSchema).optional()
}).strict();

export default TwoFactorScalarRelationFilterSchema;
