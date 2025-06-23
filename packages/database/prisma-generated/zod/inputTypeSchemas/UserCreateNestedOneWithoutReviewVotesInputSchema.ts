import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutReviewVotesInputSchema } from './UserCreateWithoutReviewVotesInputSchema';
import { UserUncheckedCreateWithoutReviewVotesInputSchema } from './UserUncheckedCreateWithoutReviewVotesInputSchema';
import { UserCreateOrConnectWithoutReviewVotesInputSchema } from './UserCreateOrConnectWithoutReviewVotesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutReviewVotesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewVotesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutReviewVotesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutReviewVotesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewVotesInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutReviewVotesInputSchema;
