import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutCollectionsInputSchema } from './BrandUpdateWithoutCollectionsInputSchema';
import { BrandUncheckedUpdateWithoutCollectionsInputSchema } from './BrandUncheckedUpdateWithoutCollectionsInputSchema';

export const BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.BrandUpdateWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutCollectionsInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateWithWhereUniqueWithoutCollectionsInputSchema;
