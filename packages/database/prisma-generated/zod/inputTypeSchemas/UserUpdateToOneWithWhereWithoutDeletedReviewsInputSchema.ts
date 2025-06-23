import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedReviewsInputSchema } from './UserUpdateWithoutDeletedReviewsInputSchema';
import { UserUncheckedUpdateWithoutDeletedReviewsInputSchema } from './UserUncheckedUpdateWithoutDeletedReviewsInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedReviewsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedReviewsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutDeletedReviewsInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedReviewsInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutDeletedReviewsInputSchema;
