import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryListRelationFilterSchema: z.ZodType<Prisma.RegistryListRelationFilter> = z
  .object({
    every: z.lazy(() => RegistryWhereInputSchema).optional(),
    some: z.lazy(() => RegistryWhereInputSchema).optional(),
    none: z.lazy(() => RegistryWhereInputSchema).optional(),
  })
  .strict();

export default RegistryListRelationFilterSchema;
