import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamScalarRelationFilterSchema: z.ZodType<Prisma.TeamScalarRelationFilter> = z
  .object({
    is: z.lazy(() => TeamWhereInputSchema).optional(),
    isNot: z.lazy(() => TeamWhereInputSchema).optional(),
  })
  .strict();

export default TeamScalarRelationFilterSchema;
