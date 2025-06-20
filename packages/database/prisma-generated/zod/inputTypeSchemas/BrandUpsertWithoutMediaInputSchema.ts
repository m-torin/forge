import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandUpdateWithoutMediaInputSchema } from './BrandUpdateWithoutMediaInputSchema';
import { BrandUncheckedUpdateWithoutMediaInputSchema } from './BrandUncheckedUpdateWithoutMediaInputSchema';
import { BrandCreateWithoutMediaInputSchema } from './BrandCreateWithoutMediaInputSchema';
import { BrandUncheckedCreateWithoutMediaInputSchema } from './BrandUncheckedCreateWithoutMediaInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandUpsertWithoutMediaInputSchema: z.ZodType<Prisma.BrandUpsertWithoutMediaInput> = z.object({
  update: z.union([ z.lazy(() => BrandUpdateWithoutMediaInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutMediaInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutMediaInputSchema),z.lazy(() => BrandUncheckedCreateWithoutMediaInputSchema) ]),
  where: z.lazy(() => BrandWhereInputSchema).optional()
}).strict();

export default BrandUpsertWithoutMediaInputSchema;
