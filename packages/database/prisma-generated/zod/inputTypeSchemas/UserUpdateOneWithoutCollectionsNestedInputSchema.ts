import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutCollectionsInputSchema } from './UserCreateWithoutCollectionsInputSchema';
import { UserUncheckedCreateWithoutCollectionsInputSchema } from './UserUncheckedCreateWithoutCollectionsInputSchema';
import { UserCreateOrConnectWithoutCollectionsInputSchema } from './UserCreateOrConnectWithoutCollectionsInputSchema';
import { UserUpsertWithoutCollectionsInputSchema } from './UserUpsertWithoutCollectionsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutCollectionsInputSchema } from './UserUpdateToOneWithWhereWithoutCollectionsInputSchema';
import { UserUpdateWithoutCollectionsInputSchema } from './UserUpdateWithoutCollectionsInputSchema';
import { UserUncheckedUpdateWithoutCollectionsInputSchema } from './UserUncheckedUpdateWithoutCollectionsInputSchema';

export const UserUpdateOneWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutCollectionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutCollectionsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutCollectionsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCollectionsInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutCollectionsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutCollectionsInputSchema),
          z.lazy(() => UserUpdateWithoutCollectionsInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutCollectionsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutCollectionsNestedInputSchema;
