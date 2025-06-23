import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutMediaInputSchema } from './UserCreateWithoutMediaInputSchema';
import { UserUncheckedCreateWithoutMediaInputSchema } from './UserUncheckedCreateWithoutMediaInputSchema';

export const UserCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutMediaInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutMediaInputSchema;
