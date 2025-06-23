import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedReviewsInputSchema } from './UserCreateWithoutDeletedReviewsInputSchema';
import { UserUncheckedCreateWithoutDeletedReviewsInputSchema } from './UserUncheckedCreateWithoutDeletedReviewsInputSchema';
import { UserCreateOrConnectWithoutDeletedReviewsInputSchema } from './UserCreateOrConnectWithoutDeletedReviewsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedReviewsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedReviewsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedReviewsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedReviewsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedReviewsInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutDeletedReviewsInputSchema;
