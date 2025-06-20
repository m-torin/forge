import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutParentInputSchema } from './BrandUpdateWithoutParentInputSchema';
import { BrandUncheckedUpdateWithoutParentInputSchema } from './BrandUncheckedUpdateWithoutParentInputSchema';
import { BrandCreateWithoutParentInputSchema } from './BrandCreateWithoutParentInputSchema';
import { BrandUncheckedCreateWithoutParentInputSchema } from './BrandUncheckedCreateWithoutParentInputSchema';

export const BrandUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.BrandUpsertWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BrandUpdateWithoutParentInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutParentInputSchema),z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default BrandUpsertWithWhereUniqueWithoutParentInputSchema;
