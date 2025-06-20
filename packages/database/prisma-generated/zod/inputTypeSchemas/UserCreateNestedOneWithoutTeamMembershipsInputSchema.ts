import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutTeamMembershipsInputSchema } from './UserCreateWithoutTeamMembershipsInputSchema';
import { UserUncheckedCreateWithoutTeamMembershipsInputSchema } from './UserUncheckedCreateWithoutTeamMembershipsInputSchema';
import { UserCreateOrConnectWithoutTeamMembershipsInputSchema } from './UserCreateOrConnectWithoutTeamMembershipsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutTeamMembershipsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutTeamMembershipsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTeamMembershipsInputSchema),z.lazy(() => UserUncheckedCreateWithoutTeamMembershipsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTeamMembershipsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutTeamMembershipsInputSchema;
