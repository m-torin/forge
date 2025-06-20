import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedStoriesInputSchema } from './UserUpdateWithoutDeletedStoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedStoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedStoriesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedStoriesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedStoriesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDeletedStoriesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedStoriesInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutDeletedStoriesInputSchema;
