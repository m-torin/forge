import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutInvitationsSentInputSchema } from './UserCreateWithoutInvitationsSentInputSchema';
import { UserUncheckedCreateWithoutInvitationsSentInputSchema } from './UserUncheckedCreateWithoutInvitationsSentInputSchema';

export const UserCreateOrConnectWithoutInvitationsSentInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutInvitationsSentInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsSentInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsSentInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutInvitationsSentInputSchema;
