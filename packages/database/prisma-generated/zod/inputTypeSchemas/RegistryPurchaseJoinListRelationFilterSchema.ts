import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereInputSchema } from './RegistryPurchaseJoinWhereInputSchema';

export const RegistryPurchaseJoinListRelationFilterSchema: z.ZodType<Prisma.RegistryPurchaseJoinListRelationFilter> =
  z
    .object({
      every: z.lazy(() => RegistryPurchaseJoinWhereInputSchema).optional(),
      some: z.lazy(() => RegistryPurchaseJoinWhereInputSchema).optional(),
      none: z.lazy(() => RegistryPurchaseJoinWhereInputSchema).optional(),
    })
    .strict();

export default RegistryPurchaseJoinListRelationFilterSchema;
