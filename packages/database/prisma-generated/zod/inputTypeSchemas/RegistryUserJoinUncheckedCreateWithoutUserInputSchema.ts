import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  registryId: z.string()
}).strict();

export default RegistryUserJoinUncheckedCreateWithoutUserInputSchema;
