import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutReviewsInputSchema } from './UserCreateWithoutReviewsInputSchema';
import { UserUncheckedCreateWithoutReviewsInputSchema } from './UserUncheckedCreateWithoutReviewsInputSchema';

export const UserCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutReviewsInputSchema;
