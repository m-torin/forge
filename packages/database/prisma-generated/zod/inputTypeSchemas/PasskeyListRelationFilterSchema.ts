import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyWhereInputSchema } from './PasskeyWhereInputSchema';

export const PasskeyListRelationFilterSchema: z.ZodType<Prisma.PasskeyListRelationFilter> = z.object({
  every: z.lazy(() => PasskeyWhereInputSchema).optional(),
  some: z.lazy(() => PasskeyWhereInputSchema).optional(),
  none: z.lazy(() => PasskeyWhereInputSchema).optional()
}).strict();

export default PasskeyListRelationFilterSchema;
