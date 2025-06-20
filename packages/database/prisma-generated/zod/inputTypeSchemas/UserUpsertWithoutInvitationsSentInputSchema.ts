import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutInvitationsSentInputSchema } from './UserUpdateWithoutInvitationsSentInputSchema';
import { UserUncheckedUpdateWithoutInvitationsSentInputSchema } from './UserUncheckedUpdateWithoutInvitationsSentInputSchema';
import { UserCreateWithoutInvitationsSentInputSchema } from './UserCreateWithoutInvitationsSentInputSchema';
import { UserUncheckedCreateWithoutInvitationsSentInputSchema } from './UserUncheckedCreateWithoutInvitationsSentInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutInvitationsSentInputSchema: z.ZodType<Prisma.UserUpsertWithoutInvitationsSentInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutInvitationsSentInputSchema),z.lazy(() => UserUncheckedUpdateWithoutInvitationsSentInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsSentInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsSentInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutInvitationsSentInputSchema;
