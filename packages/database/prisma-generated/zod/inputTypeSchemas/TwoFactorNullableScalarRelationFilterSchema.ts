import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const TwoFactorNullableScalarRelationFilterSchema: z.ZodType<Prisma.TwoFactorNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => TwoFactorWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => TwoFactorWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default TwoFactorNullableScalarRelationFilterSchema;
