import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedStoriesInputSchema } from './UserUpdateWithoutDeletedStoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedStoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedStoriesInputSchema';
import { UserCreateWithoutDeletedStoriesInputSchema } from './UserCreateWithoutDeletedStoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedStoriesInputSchema } from './UserUncheckedCreateWithoutDeletedStoriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedStoriesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedStoriesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedStoriesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedStoriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedStoriesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedStoriesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedStoriesInputSchema;
