import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedSeriesInputSchema } from './UserCreateWithoutDeletedSeriesInputSchema';
import { UserUncheckedCreateWithoutDeletedSeriesInputSchema } from './UserUncheckedCreateWithoutDeletedSeriesInputSchema';
import { UserCreateOrConnectWithoutDeletedSeriesInputSchema } from './UserCreateOrConnectWithoutDeletedSeriesInputSchema';
import { UserUpsertWithoutDeletedSeriesInputSchema } from './UserUpsertWithoutDeletedSeriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedSeriesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedSeriesInputSchema';
import { UserUpdateWithoutDeletedSeriesInputSchema } from './UserUpdateWithoutDeletedSeriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedSeriesInputSchema } from './UserUncheckedUpdateWithoutDeletedSeriesInputSchema';

export const UserUpdateOneWithoutDeletedSeriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedSeriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedSeriesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedSeriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedSeriesInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedSeriesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedSeriesInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedSeriesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedSeriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedSeriesNestedInputSchema;
