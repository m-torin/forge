import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutInvitationsSentInputSchema } from './UserCreateWithoutInvitationsSentInputSchema';
import { UserUncheckedCreateWithoutInvitationsSentInputSchema } from './UserUncheckedCreateWithoutInvitationsSentInputSchema';
import { UserCreateOrConnectWithoutInvitationsSentInputSchema } from './UserCreateOrConnectWithoutInvitationsSentInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutInvitationsSentInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutInvitationsSentInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutInvitationsSentInputSchema),z.lazy(() => UserUncheckedCreateWithoutInvitationsSentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutInvitationsSentInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutInvitationsSentInputSchema;
