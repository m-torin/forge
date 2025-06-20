import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinCreateManyInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  userId: z.string(),
  registryId: z.string()
}).strict();

export default RegistryUserJoinCreateManyInputSchema;
