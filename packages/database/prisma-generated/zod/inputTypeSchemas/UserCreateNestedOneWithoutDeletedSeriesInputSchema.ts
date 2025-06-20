import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedSeriesInputSchema } from './UserCreateWithoutDeletedSeriesInputSchema';
import { UserUncheckedCreateWithoutDeletedSeriesInputSchema } from './UserUncheckedCreateWithoutDeletedSeriesInputSchema';
import { UserCreateOrConnectWithoutDeletedSeriesInputSchema } from './UserCreateOrConnectWithoutDeletedSeriesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedSeriesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedSeriesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedSeriesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedSeriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedSeriesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedSeriesInputSchema;
