import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedTaxonomiesInputSchema } from './UserCreateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema';
import { UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema } from './UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema';
import { UserUpsertWithoutDeletedTaxonomiesInputSchema } from './UserUpsertWithoutDeletedTaxonomiesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInputSchema';
import { UserUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUpdateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema';

export const UserUpdateOneWithoutDeletedTaxonomiesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedTaxonomiesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedTaxonomiesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema)
        .optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedTaxonomiesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedTaxonomiesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedTaxonomiesNestedInputSchema;
