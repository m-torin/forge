import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { UserCreateNestedOneWithoutRegistriesInputSchema } from './UserCreateNestedOneWithoutRegistriesInputSchema';
import { RegistryCreateNestedOneWithoutUsersInputSchema } from './RegistryCreateNestedOneWithoutUsersInputSchema';

export const RegistryUserJoinCreateInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  role: z.lazy(() => RegistryUserRoleSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutRegistriesInputSchema),
  registry: z.lazy(() => RegistryCreateNestedOneWithoutUsersInputSchema)
}).strict();

export default RegistryUserJoinCreateInputSchema;
