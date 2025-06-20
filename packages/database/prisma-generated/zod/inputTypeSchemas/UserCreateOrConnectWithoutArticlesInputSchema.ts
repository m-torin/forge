import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutArticlesInputSchema } from './UserCreateWithoutArticlesInputSchema';
import { UserUncheckedCreateWithoutArticlesInputSchema } from './UserUncheckedCreateWithoutArticlesInputSchema';

export const UserCreateOrConnectWithoutArticlesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutArticlesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutArticlesInputSchema),z.lazy(() => UserUncheckedCreateWithoutArticlesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutArticlesInputSchema;
