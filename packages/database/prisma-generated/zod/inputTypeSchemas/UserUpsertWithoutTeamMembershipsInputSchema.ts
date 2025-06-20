import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutTeamMembershipsInputSchema } from './UserUpdateWithoutTeamMembershipsInputSchema';
import { UserUncheckedUpdateWithoutTeamMembershipsInputSchema } from './UserUncheckedUpdateWithoutTeamMembershipsInputSchema';
import { UserCreateWithoutTeamMembershipsInputSchema } from './UserCreateWithoutTeamMembershipsInputSchema';
import { UserUncheckedCreateWithoutTeamMembershipsInputSchema } from './UserUncheckedCreateWithoutTeamMembershipsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutTeamMembershipsInputSchema: z.ZodType<Prisma.UserUpsertWithoutTeamMembershipsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutTeamMembershipsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutTeamMembershipsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutTeamMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutTeamMembershipsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutTeamMembershipsInputSchema;
