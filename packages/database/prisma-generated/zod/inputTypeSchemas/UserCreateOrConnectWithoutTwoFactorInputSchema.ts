import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutTwoFactorInputSchema } from './UserCreateWithoutTwoFactorInputSchema';
import { UserUncheckedCreateWithoutTwoFactorInputSchema } from './UserUncheckedCreateWithoutTwoFactorInputSchema';

export const UserCreateOrConnectWithoutTwoFactorInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutTwoFactorInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedCreateWithoutTwoFactorInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutTwoFactorInputSchema;
