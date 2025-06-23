import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedReviewsInputSchema } from './UserUpdateWithoutDeletedReviewsInputSchema';
import { UserUncheckedUpdateWithoutDeletedReviewsInputSchema } from './UserUncheckedUpdateWithoutDeletedReviewsInputSchema';
import { UserCreateWithoutDeletedReviewsInputSchema } from './UserCreateWithoutDeletedReviewsInputSchema';
import { UserUncheckedCreateWithoutDeletedReviewsInputSchema } from './UserUncheckedCreateWithoutDeletedReviewsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedReviewsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedReviewsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedReviewsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedReviewsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedReviewsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedReviewsInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedReviewsInputSchema;
