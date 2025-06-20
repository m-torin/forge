import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandUpdateWithoutJollyRogerInputSchema } from './BrandUpdateWithoutJollyRogerInputSchema';
import { BrandUncheckedUpdateWithoutJollyRogerInputSchema } from './BrandUncheckedUpdateWithoutJollyRogerInputSchema';
import { BrandCreateWithoutJollyRogerInputSchema } from './BrandCreateWithoutJollyRogerInputSchema';
import { BrandUncheckedCreateWithoutJollyRogerInputSchema } from './BrandUncheckedCreateWithoutJollyRogerInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandUpsertWithoutJollyRogerInputSchema: z.ZodType<Prisma.BrandUpsertWithoutJollyRogerInput> = z.object({
  update: z.union([ z.lazy(() => BrandUpdateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutJollyRogerInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedCreateWithoutJollyRogerInputSchema) ]),
  where: z.lazy(() => BrandWhereInputSchema).optional()
}).strict();

export default BrandUpsertWithoutJollyRogerInputSchema;
