import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandUpdateWithoutIdentifiersInputSchema } from './BrandUpdateWithoutIdentifiersInputSchema';
import { BrandUncheckedUpdateWithoutIdentifiersInputSchema } from './BrandUncheckedUpdateWithoutIdentifiersInputSchema';

export const BrandUpdateToOneWithWhereWithoutIdentifiersInputSchema: z.ZodType<Prisma.BrandUpdateToOneWithWhereWithoutIdentifiersInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutIdentifiersInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutIdentifiersInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateToOneWithWhereWithoutIdentifiersInputSchema;
