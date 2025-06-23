import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedProductCategoriesInputSchema } from './UserCreateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema';
import { UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema } from './UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema';
import { UserUpsertWithoutDeletedProductCategoriesInputSchema } from './UserUpsertWithoutDeletedProductCategoriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInputSchema';
import { UserUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUpdateWithoutDeletedProductCategoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema';

export const UserUpdateOneWithoutDeletedProductCategoriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedProductCategoriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedProductCategoriesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedProductCategoriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutDeletedProductCategoriesInputSchema)
        .optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedProductCategoriesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedProductCategoriesInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedProductCategoriesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedProductCategoriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedProductCategoriesNestedInputSchema;
