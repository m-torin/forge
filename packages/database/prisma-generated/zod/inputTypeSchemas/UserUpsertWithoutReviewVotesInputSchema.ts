import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutReviewVotesInputSchema } from './UserUpdateWithoutReviewVotesInputSchema';
import { UserUncheckedUpdateWithoutReviewVotesInputSchema } from './UserUncheckedUpdateWithoutReviewVotesInputSchema';
import { UserCreateWithoutReviewVotesInputSchema } from './UserCreateWithoutReviewVotesInputSchema';
import { UserUncheckedCreateWithoutReviewVotesInputSchema } from './UserUncheckedCreateWithoutReviewVotesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutReviewVotesInputSchema: z.ZodType<Prisma.UserUpsertWithoutReviewVotesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutReviewVotesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutReviewVotesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewVotesInputSchema),z.lazy(() => UserUncheckedCreateWithoutReviewVotesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutReviewVotesInputSchema;
