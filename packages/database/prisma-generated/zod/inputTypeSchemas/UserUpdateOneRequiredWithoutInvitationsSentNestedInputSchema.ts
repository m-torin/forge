import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutInvitationsSentInputSchema } from './UserCreateWithoutInvitationsSentInputSchema';
import { UserUncheckedCreateWithoutInvitationsSentInputSchema } from './UserUncheckedCreateWithoutInvitationsSentInputSchema';
import { UserCreateOrConnectWithoutInvitationsSentInputSchema } from './UserCreateOrConnectWithoutInvitationsSentInputSchema';
import { UserUpsertWithoutInvitationsSentInputSchema } from './UserUpsertWithoutInvitationsSentInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutInvitationsSentInputSchema } from './UserUpdateToOneWithWhereWithoutInvitationsSentInputSchema';
import { UserUpdateWithoutInvitationsSentInputSchema } from './UserUpdateWithoutInvitationsSentInputSchema';
import { UserUncheckedUpdateWithoutInvitationsSentInputSchema } from './UserUncheckedUpdateWithoutInvitationsSentInputSchema';

export const UserUpdateOneRequiredWithoutInvitationsSentNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutInvitationsSentNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutInvitationsSentInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutInvitationsSentInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutInvitationsSentInputSchema)
        .optional(),
      upsert: z.lazy(() => UserUpsertWithoutInvitationsSentInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutInvitationsSentInputSchema),
          z.lazy(() => UserUpdateWithoutInvitationsSentInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutInvitationsSentInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutInvitationsSentNestedInputSchema;
