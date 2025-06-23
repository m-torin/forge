import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedStoriesInputSchema } from './UserCreateWithoutDeletedStoriesInputSchema';
import { UserUncheckedCreateWithoutDeletedStoriesInputSchema } from './UserUncheckedCreateWithoutDeletedStoriesInputSchema';
import { UserCreateOrConnectWithoutDeletedStoriesInputSchema } from './UserCreateOrConnectWithoutDeletedStoriesInputSchema';
import { UserUpsertWithoutDeletedStoriesInputSchema } from './UserUpsertWithoutDeletedStoriesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedStoriesInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedStoriesInputSchema';
import { UserUpdateWithoutDeletedStoriesInputSchema } from './UserUpdateWithoutDeletedStoriesInputSchema';
import { UserUncheckedUpdateWithoutDeletedStoriesInputSchema } from './UserUncheckedUpdateWithoutDeletedStoriesInputSchema';

export const UserUpdateOneWithoutDeletedStoriesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedStoriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutDeletedStoriesInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutDeletedStoriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedStoriesInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutDeletedStoriesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedStoriesInputSchema),
          z.lazy(() => UserUpdateWithoutDeletedStoriesInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutDeletedStoriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutDeletedStoriesNestedInputSchema;
