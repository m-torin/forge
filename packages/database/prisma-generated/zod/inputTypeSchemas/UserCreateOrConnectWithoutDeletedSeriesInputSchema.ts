import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedSeriesInputSchema } from './UserCreateWithoutDeletedSeriesInputSchema';
import { UserUncheckedCreateWithoutDeletedSeriesInputSchema } from './UserUncheckedCreateWithoutDeletedSeriesInputSchema';

export const UserCreateOrConnectWithoutDeletedSeriesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedSeriesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedSeriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedSeriesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutDeletedSeriesInputSchema;
