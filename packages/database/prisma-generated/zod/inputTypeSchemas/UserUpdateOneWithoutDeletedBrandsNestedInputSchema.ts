import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedBrandsInputSchema } from './UserCreateWithoutDeletedBrandsInputSchema';
import { UserUncheckedCreateWithoutDeletedBrandsInputSchema } from './UserUncheckedCreateWithoutDeletedBrandsInputSchema';
import { UserCreateOrConnectWithoutDeletedBrandsInputSchema } from './UserCreateOrConnectWithoutDeletedBrandsInputSchema';
import { UserUpsertWithoutDeletedBrandsInputSchema } from './UserUpsertWithoutDeletedBrandsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedBrandsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedBrandsInputSchema';
import { UserUpdateWithoutDeletedBrandsInputSchema } from './UserUpdateWithoutDeletedBrandsInputSchema';
import { UserUncheckedUpdateWithoutDeletedBrandsInputSchema } from './UserUncheckedUpdateWithoutDeletedBrandsInputSchema';

export const UserUpdateOneWithoutDeletedBrandsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedBrandsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedBrandsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedBrandsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedBrandsInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedBrandsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedBrandsInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedBrandsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedBrandsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedBrandsNestedInputSchema;
