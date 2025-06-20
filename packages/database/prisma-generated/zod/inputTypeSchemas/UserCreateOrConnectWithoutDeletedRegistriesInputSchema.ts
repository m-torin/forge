import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedRegistriesInputSchema } from './UserCreateWithoutDeletedRegistriesInputSchema';
import { UserUncheckedCreateWithoutDeletedRegistriesInputSchema } from './UserUncheckedCreateWithoutDeletedRegistriesInputSchema';

export const UserCreateOrConnectWithoutDeletedRegistriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedRegistriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedRegistriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedRegistriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedRegistriesInputSchema;
