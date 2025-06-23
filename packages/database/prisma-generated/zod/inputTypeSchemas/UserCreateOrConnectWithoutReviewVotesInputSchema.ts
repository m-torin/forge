import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutReviewVotesInputSchema } from './UserCreateWithoutReviewVotesInputSchema';
import { UserUncheckedCreateWithoutReviewVotesInputSchema } from './UserUncheckedCreateWithoutReviewVotesInputSchema';

export const UserCreateOrConnectWithoutReviewVotesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutReviewVotesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutReviewVotesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutReviewVotesInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutReviewVotesInputSchema;
