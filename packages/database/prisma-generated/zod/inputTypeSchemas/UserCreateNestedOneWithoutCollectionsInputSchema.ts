import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutCollectionsInputSchema } from './UserCreateWithoutCollectionsInputSchema';
import { UserUncheckedCreateWithoutCollectionsInputSchema } from './UserUncheckedCreateWithoutCollectionsInputSchema';
import { UserCreateOrConnectWithoutCollectionsInputSchema } from './UserCreateOrConnectWithoutCollectionsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutCollectionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCollectionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutCollectionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutCollectionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCollectionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutCollectionsInputSchema;
