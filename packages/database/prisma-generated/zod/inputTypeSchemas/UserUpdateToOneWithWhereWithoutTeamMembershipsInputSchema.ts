import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutTeamMembershipsInputSchema } from './UserUpdateWithoutTeamMembershipsInputSchema';
import { UserUncheckedUpdateWithoutTeamMembershipsInputSchema } from './UserUncheckedUpdateWithoutTeamMembershipsInputSchema';

export const UserUpdateToOneWithWhereWithoutTeamMembershipsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTeamMembershipsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutTeamMembershipsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTeamMembershipsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutTeamMembershipsInputSchema;
