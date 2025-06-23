import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamNullableScalarRelationFilterSchema: z.ZodType<Prisma.TeamNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => TeamWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => TeamWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default TeamNullableScalarRelationFilterSchema;
