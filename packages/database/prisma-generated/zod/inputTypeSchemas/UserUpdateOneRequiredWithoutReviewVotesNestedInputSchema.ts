import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutReviewVotesInputSchema } from './UserCreateWithoutReviewVotesInputSchema';
import { UserUncheckedCreateWithoutReviewVotesInputSchema } from './UserUncheckedCreateWithoutReviewVotesInputSchema';
import { UserCreateOrConnectWithoutReviewVotesInputSchema } from './UserCreateOrConnectWithoutReviewVotesInputSchema';
import { UserUpsertWithoutReviewVotesInputSchema } from './UserUpsertWithoutReviewVotesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutReviewVotesInputSchema } from './UserUpdateToOneWithWhereWithoutReviewVotesInputSchema';
import { UserUpdateWithoutReviewVotesInputSchema } from './UserUpdateWithoutReviewVotesInputSchema';
import { UserUncheckedUpdateWithoutReviewVotesInputSchema } from './UserUncheckedUpdateWithoutReviewVotesInputSchema';

export const UserUpdateOneRequiredWithoutReviewVotesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReviewVotesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutReviewVotesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutReviewVotesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewVotesInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutReviewVotesInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutReviewVotesInputSchema),
          z.lazy(() => UserUpdateWithoutReviewVotesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutReviewVotesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneRequiredWithoutReviewVotesNestedInputSchema;
