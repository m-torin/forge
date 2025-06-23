import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandUpdateWithoutMediaInputSchema } from './BrandUpdateWithoutMediaInputSchema';
import { BrandUncheckedUpdateWithoutMediaInputSchema } from './BrandUncheckedUpdateWithoutMediaInputSchema';

export const BrandUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.BrandUpdateToOneWithWhereWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutMediaInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateToOneWithWhereWithoutMediaInputSchema;
