import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereInputSchema } from './RegistryItemWhereInputSchema';

export const RegistryItemScalarRelationFilterSchema: z.ZodType<Prisma.RegistryItemScalarRelationFilter> = z.object({
  is: z.lazy(() => RegistryItemWhereInputSchema).optional(),
  isNot: z.lazy(() => RegistryItemWhereInputSchema).optional()
}).strict();

export default RegistryItemScalarRelationFilterSchema;
