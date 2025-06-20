import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandUpdateWithoutJollyRogerInputSchema } from './BrandUpdateWithoutJollyRogerInputSchema';
import { BrandUncheckedUpdateWithoutJollyRogerInputSchema } from './BrandUncheckedUpdateWithoutJollyRogerInputSchema';

export const BrandUpdateToOneWithWhereWithoutJollyRogerInputSchema: z.ZodType<Prisma.BrandUpdateToOneWithWhereWithoutJollyRogerInput> = z.object({
  where: z.lazy(() => BrandWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BrandUpdateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutJollyRogerInputSchema) ]),
}).strict();

export default BrandUpdateToOneWithWhereWithoutJollyRogerInputSchema;
