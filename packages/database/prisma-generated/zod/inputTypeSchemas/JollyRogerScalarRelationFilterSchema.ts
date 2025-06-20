import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';

export const JollyRogerScalarRelationFilterSchema: z.ZodType<Prisma.JollyRogerScalarRelationFilter> = z.object({
  is: z.lazy(() => JollyRogerWhereInputSchema).optional(),
  isNot: z.lazy(() => JollyRogerWhereInputSchema).optional()
}).strict();

export default JollyRogerScalarRelationFilterSchema;
