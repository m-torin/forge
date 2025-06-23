import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedSeriesInputSchema } from './UserUpdateWithoutDeletedSeriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedSeriesInputSchema } from './UserUncheckedUpdateWithoutDeletedSeriesInputSchema';
import { UserCreateWithoutDeletedSeriesInputSchema } from './UserCreateWithoutDeletedSeriesInputSchema';
import { UserUncheckedCreateWithoutDeletedSeriesInputSchema } from './UserUncheckedCreateWithoutDeletedSeriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedSeriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedSeriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedSeriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedSeriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedSeriesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedSeriesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedSeriesInputSchema;
