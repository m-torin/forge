import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutTeamMembershipsInputSchema } from './UserCreateWithoutTeamMembershipsInputSchema';
import { UserUncheckedCreateWithoutTeamMembershipsInputSchema } from './UserUncheckedCreateWithoutTeamMembershipsInputSchema';
import { UserCreateOrConnectWithoutTeamMembershipsInputSchema } from './UserCreateOrConnectWithoutTeamMembershipsInputSchema';
import { UserUpsertWithoutTeamMembershipsInputSchema } from './UserUpsertWithoutTeamMembershipsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutTeamMembershipsInputSchema } from './UserUpdateToOneWithWhereWithoutTeamMembershipsInputSchema';
import { UserUpdateWithoutTeamMembershipsInputSchema } from './UserUpdateWithoutTeamMembershipsInputSchema';
import { UserUncheckedUpdateWithoutTeamMembershipsInputSchema } from './UserUncheckedUpdateWithoutTeamMembershipsInputSchema';

export const UserUpdateOneRequiredWithoutTeamMembershipsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutTeamMembershipsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutTeamMembershipsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutTeamMembershipsInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutTeamMembershipsInputSchema)
        .optional(),
      upsert: z.lazy(() => UserUpsertWithoutTeamMembershipsInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutTeamMembershipsInputSchema),
          z.lazy(() => UserUpdateWithoutTeamMembershipsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutTeamMembershipsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutTeamMembershipsNestedInputSchema;
