import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUpdateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema';
import { UserCreateWithoutDeletedTaxonomiesInputSchema } from './UserCreateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedTaxonomiesInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedTaxonomiesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => UserUpdateWithoutDeletedTaxonomiesInputSchema),
        z.lazy(() => UserUncheckedUpdateWithoutDeletedTaxonomiesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedTaxonomiesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema),
      ]),
      where: z.lazy(() => UserWhereInputSchema).optional(),
    })
    .strict();

export default UserUpsertWithoutDeletedTaxonomiesInputSchema;
