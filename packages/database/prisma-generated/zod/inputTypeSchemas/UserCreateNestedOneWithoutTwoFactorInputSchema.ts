import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutTwoFactorInputSchema } from './UserCreateWithoutTwoFactorInputSchema';
import { UserUncheckedCreateWithoutTwoFactorInputSchema } from './UserUncheckedCreateWithoutTwoFactorInputSchema';
import { UserCreateOrConnectWithoutTwoFactorInputSchema } from './UserCreateOrConnectWithoutTwoFactorInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutTwoFactorInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutTwoFactorInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutTwoFactorInputSchema),z.lazy(() => UserUncheckedCreateWithoutTwoFactorInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTwoFactorInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutTwoFactorInputSchema;
