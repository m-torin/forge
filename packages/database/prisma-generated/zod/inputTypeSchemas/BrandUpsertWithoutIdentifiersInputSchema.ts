import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandUpdateWithoutIdentifiersInputSchema } from './BrandUpdateWithoutIdentifiersInputSchema';
import { BrandUncheckedUpdateWithoutIdentifiersInputSchema } from './BrandUncheckedUpdateWithoutIdentifiersInputSchema';
import { BrandCreateWithoutIdentifiersInputSchema } from './BrandCreateWithoutIdentifiersInputSchema';
import { BrandUncheckedCreateWithoutIdentifiersInputSchema } from './BrandUncheckedCreateWithoutIdentifiersInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandUpsertWithoutIdentifiersInputSchema: z.ZodType<Prisma.BrandUpsertWithoutIdentifiersInput> = z.object({
  update: z.union([ z.lazy(() => BrandUpdateWithoutIdentifiersInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutIdentifiersInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutIdentifiersInputSchema),z.lazy(() => BrandUncheckedCreateWithoutIdentifiersInputSchema) ]),
  where: z.lazy(() => BrandWhereInputSchema).optional()
}).strict();

export default BrandUpsertWithoutIdentifiersInputSchema;
