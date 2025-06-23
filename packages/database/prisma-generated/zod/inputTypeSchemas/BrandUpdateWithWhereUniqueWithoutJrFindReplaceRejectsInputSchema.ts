import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutJrFindReplaceRejectsInputSchema } from './BrandUpdateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
