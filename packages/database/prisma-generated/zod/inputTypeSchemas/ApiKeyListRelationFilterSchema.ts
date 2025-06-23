import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyWhereInputSchema } from './ApiKeyWhereInputSchema';

export const ApiKeyListRelationFilterSchema: z.ZodType<Prisma.ApiKeyListRelationFilter> = z
  .object({
    every: z.lazy(() => ApiKeyWhereInputSchema).optional(),
    some: z.lazy(() => ApiKeyWhereInputSchema).optional(),
    none: z.lazy(() => ApiKeyWhereInputSchema).optional(),
  })
  .strict();

export default ApiKeyListRelationFilterSchema;
