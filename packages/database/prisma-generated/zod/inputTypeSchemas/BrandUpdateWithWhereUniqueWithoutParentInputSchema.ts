import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutParentInputSchema } from './BrandUpdateWithoutParentInputSchema';
import { BrandUncheckedUpdateWithoutParentInputSchema } from './BrandUncheckedUpdateWithoutParentInputSchema';

export const BrandUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.BrandUpdateWithWhereUniqueWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutParentInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutParentInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateWithWhereUniqueWithoutParentInputSchema;
