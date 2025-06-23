import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutTeamMembershipsInputSchema } from './UserCreateWithoutTeamMembershipsInputSchema';
import { UserUncheckedCreateWithoutTeamMembershipsInputSchema } from './UserUncheckedCreateWithoutTeamMembershipsInputSchema';

export const UserCreateOrConnectWithoutTeamMembershipsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutTeamMembershipsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutTeamMembershipsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutTeamMembershipsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutTeamMembershipsInputSchema;
