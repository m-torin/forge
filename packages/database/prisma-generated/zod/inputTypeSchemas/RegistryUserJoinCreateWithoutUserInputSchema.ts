import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { RegistryCreateNestedOneWithoutUsersInputSchema } from './RegistryCreateNestedOneWithoutUsersInputSchema';

export const RegistryUserJoinCreateWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  registry: z.lazy(() => RegistryCreateNestedOneWithoutUsersInputSchema)
}).strict();

export default RegistryUserJoinCreateWithoutUserInputSchema;
