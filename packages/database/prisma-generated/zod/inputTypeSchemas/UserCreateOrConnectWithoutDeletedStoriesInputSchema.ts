import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedStoriesInputSchema } from './UserCreateWithoutDeletedStoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedStoriesInputSchema } from './UserUncheckedCreateWithoutDeletedStoriesInputSchema';

export const UserCreateOrConnectWithoutDeletedStoriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedStoriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedStoriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedStoriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedStoriesInputSchema;
