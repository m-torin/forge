import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutCollectionsInputSchema } from './UserCreateWithoutCollectionsInputSchema';
import { UserUncheckedCreateWithoutCollectionsInputSchema } from './UserUncheckedCreateWithoutCollectionsInputSchema';

export const UserCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutCollectionsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutCollectionsInputSchema;
