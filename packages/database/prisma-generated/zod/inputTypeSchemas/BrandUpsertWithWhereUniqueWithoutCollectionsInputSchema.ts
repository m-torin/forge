import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutCollectionsInputSchema } from './BrandUpdateWithoutCollectionsInputSchema';
import { BrandUncheckedUpdateWithoutCollectionsInputSchema } from './BrandUncheckedUpdateWithoutCollectionsInputSchema';
import { BrandCreateWithoutCollectionsInputSchema } from './BrandCreateWithoutCollectionsInputSchema';
import { BrandUncheckedCreateWithoutCollectionsInputSchema } from './BrandUncheckedCreateWithoutCollectionsInputSchema';

export const BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.BrandUpsertWithWhereUniqueWithoutCollectionsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BrandUpdateWithoutCollectionsInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutCollectionsInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutCollectionsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default BrandUpsertWithWhereUniqueWithoutCollectionsInputSchema;
