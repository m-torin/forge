import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutMembersInputSchema } from './UserUpdateWithoutMembersInputSchema';
import { UserUncheckedUpdateWithoutMembersInputSchema } from './UserUncheckedUpdateWithoutMembersInputSchema';

export const UserUpdateToOneWithWhereWithoutMembersInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutMembersInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutMembersInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMembersInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutMembersInputSchema;
