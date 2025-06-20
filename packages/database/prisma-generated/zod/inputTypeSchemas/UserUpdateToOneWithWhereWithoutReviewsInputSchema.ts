import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutReviewsInputSchema } from './UserUpdateWithoutReviewsInputSchema';
import { UserUncheckedUpdateWithoutReviewsInputSchema } from './UserUncheckedUpdateWithoutReviewsInputSchema';

export const UserUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutReviewsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutReviewsInputSchema;
