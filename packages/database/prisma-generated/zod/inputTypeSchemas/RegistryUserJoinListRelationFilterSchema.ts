import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereInputSchema } from './RegistryUserJoinWhereInputSchema';

export const RegistryUserJoinListRelationFilterSchema: z.ZodType<Prisma.RegistryUserJoinListRelationFilter> = z.object({
  every: z.lazy(() => RegistryUserJoinWhereInputSchema).optional(),
  some: z.lazy(() => RegistryUserJoinWhereInputSchema).optional(),
  none: z.lazy(() => RegistryUserJoinWhereInputSchema).optional()
}).strict();

export default RegistryUserJoinListRelationFilterSchema;
