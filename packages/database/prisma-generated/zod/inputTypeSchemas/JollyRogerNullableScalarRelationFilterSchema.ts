import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';

export const JollyRogerNullableScalarRelationFilterSchema: z.ZodType<Prisma.JollyRogerNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => JollyRogerWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => JollyRogerWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default JollyRogerNullableScalarRelationFilterSchema;
