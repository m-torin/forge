import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryScalarRelationFilterSchema: z.ZodType<Prisma.RegistryScalarRelationFilter> = z
  .object({
    is: z.lazy(() => RegistryWhereInputSchema).optional(),
    isNot: z.lazy(() => RegistryWhereInputSchema).optional(),
  })
  .strict();

export default RegistryScalarRelationFilterSchema;
