import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutCollectionsInputSchema } from './UserUpdateWithoutCollectionsInputSchema';
import { UserUncheckedUpdateWithoutCollectionsInputSchema } from './UserUncheckedUpdateWithoutCollectionsInputSchema';

export const UserUpdateToOneWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutCollectionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutCollectionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutCollectionsInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutCollectionsInputSchema;
