import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedReviewsInputSchema } from './UserCreateWithoutDeletedReviewsInputSchema';
import { UserUncheckedCreateWithoutDeletedReviewsInputSchema } from './UserUncheckedCreateWithoutDeletedReviewsInputSchema';

export const UserCreateOrConnectWithoutDeletedReviewsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedReviewsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedReviewsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedReviewsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedReviewsInputSchema;
