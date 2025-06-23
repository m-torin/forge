import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutInvitationsSentInputSchema } from './UserUpdateWithoutInvitationsSentInputSchema';
import { UserUncheckedUpdateWithoutInvitationsSentInputSchema } from './UserUncheckedUpdateWithoutInvitationsSentInputSchema';

export const UserUpdateToOneWithWhereWithoutInvitationsSentInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutInvitationsSentInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutInvitationsSentInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutInvitationsSentInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutInvitationsSentInputSchema;
