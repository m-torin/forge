import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUncheckedCreateWithoutRegistryInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      role: z.lazy(() => RegistryUserRoleSchema).optional(),
      userId: z.string(),
    })
    .strict();

export default RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema;
