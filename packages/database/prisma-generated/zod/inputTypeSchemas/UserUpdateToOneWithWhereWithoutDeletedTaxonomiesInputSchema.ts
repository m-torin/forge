import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUpdateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema';

export const UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutDeletedTaxonomiesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema) ]),
}).strict();

export default UserUpdateToOneWithWhereWithoutDeletedTaxonomiesInputSchema;
