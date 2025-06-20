import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { UserCreateNestedOneWithoutRegistriesInputSchema } from './UserCreateNestedOneWithoutRegistriesInputSchema';

export const RegistryUserJoinCreateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateWithoutRegistryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutRegistriesInputSchema)
}).strict();

export default RegistryUserJoinCreateWithoutRegistryInputSchema;
