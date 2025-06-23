import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutReviewVotesInputSchema } from './UserUpdateWithoutReviewVotesInputSchema';
import { UserUncheckedUpdateWithoutReviewVotesInputSchema } from './UserUncheckedUpdateWithoutReviewVotesInputSchema';

export const UserUpdateToOneWithWhereWithoutReviewVotesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutReviewVotesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => UserUpdateWithoutReviewVotesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutReviewVotesInputSchema),
      ]),
    })
    .strict();

export default UserUpdateToOneWithWhereWithoutReviewVotesInputSchema;
