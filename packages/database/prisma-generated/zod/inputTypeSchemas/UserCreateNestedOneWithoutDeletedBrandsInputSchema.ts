import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedBrandsInputSchema } from './UserCreateWithoutDeletedBrandsInputSchema';
import { UserUncheckedCreateWithoutDeletedBrandsInputSchema } from './UserUncheckedCreateWithoutDeletedBrandsInputSchema';
import { UserCreateOrConnectWithoutDeletedBrandsInputSchema } from './UserCreateOrConnectWithoutDeletedBrandsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedBrandsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedBrandsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedBrandsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedBrandsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedBrandsInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutDeletedBrandsInputSchema;
