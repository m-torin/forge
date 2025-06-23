import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereInputSchema } from './RegistryItemWhereInputSchema';

export const RegistryItemListRelationFilterSchema: z.ZodType<Prisma.RegistryItemListRelationFilter> =
  z
    .object({
      every: z.lazy(() => RegistryItemWhereInputSchema).optional(),
      some: z.lazy(() => RegistryItemWhereInputSchema).optional(),
      none: z.lazy(() => RegistryItemWhereInputSchema).optional(),
    })
    .strict();

export default RegistryItemListRelationFilterSchema;
