import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutJrFindReplaceRejectsInputSchema } from './BrandUpdateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { BrandCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => BrandUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default BrandUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
