import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedStoriesInputSchema } from './UserCreateWithoutDeletedStoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedStoriesInputSchema } from './UserUncheckedCreateWithoutDeletedStoriesInputSchema';
import { UserCreateOrConnectWithoutDeletedStoriesInputSchema } from './UserCreateOrConnectWithoutDeletedStoriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedStoriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedStoriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedStoriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedStoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedStoriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedStoriesInputSchema;
