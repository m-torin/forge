import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedSeriesInputSchema } from './UserUpdateWithoutDeletedSeriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedSeriesInputSchema } from './UserUncheckedUpdateWithoutDeletedSeriesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedSeriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedSeriesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedSeriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedSeriesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedSeriesInputSchema;
