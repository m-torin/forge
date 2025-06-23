import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedBrandsInputSchema } from './UserCreateWithoutDeletedBrandsInputSchema';
import { UserUncheckedCreateWithoutDeletedBrandsInputSchema } from './UserUncheckedCreateWithoutDeletedBrandsInputSchema';

export const UserCreateOrConnectWithoutDeletedBrandsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedBrandsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedBrandsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedBrandsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutDeletedBrandsInputSchema;
