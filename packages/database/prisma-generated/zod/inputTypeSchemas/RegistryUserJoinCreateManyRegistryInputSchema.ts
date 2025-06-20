import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinCreateManyRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyRegistryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  userId: z.string()
}).strict();

export default RegistryUserJoinCreateManyRegistryInputSchema;
