import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryNullableScalarRelationFilterSchema: z.ZodType<Prisma.RegistryNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => RegistryWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => RegistryWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default RegistryNullableScalarRelationFilterSchema;
