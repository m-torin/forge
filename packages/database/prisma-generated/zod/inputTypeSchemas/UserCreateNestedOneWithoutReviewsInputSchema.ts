import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutReviewsInputSchema } from './UserCreateWithoutReviewsInputSchema';
import { UserUncheckedCreateWithoutReviewsInputSchema } from './UserUncheckedCreateWithoutReviewsInputSchema';
import { UserCreateOrConnectWithoutReviewsInputSchema } from './UserCreateOrConnectWithoutReviewsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutReviewsInputSchema;
