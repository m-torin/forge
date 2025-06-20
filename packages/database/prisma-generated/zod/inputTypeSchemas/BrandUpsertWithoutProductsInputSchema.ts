import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandUpdateWithoutProductsInputSchema } from './BrandUpdateWithoutProductsInputSchema';
import { BrandUncheckedUpdateWithoutProductsInputSchema } from './BrandUncheckedUpdateWithoutProductsInputSchema';
import { BrandCreateWithoutProductsInputSchema } from './BrandCreateWithoutProductsInputSchema';
import { BrandUncheckedCreateWithoutProductsInputSchema } from './BrandUncheckedCreateWithoutProductsInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandUpsertWithoutProductsInputSchema: z.ZodType<Prisma.BrandUpsertWithoutProductsInput> = z.object({
  update: z.union([ z.lazy(() => BrandUpdateWithoutProductsInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutProductsInputSchema) ]),
  where: z.lazy(() => BrandWhereInputSchema).optional()
}).strict();

export default BrandUpsertWithoutProductsInputSchema;
