import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutProductsInputSchema } from './BrandCreateWithoutProductsInputSchema';
import { BrandUncheckedCreateWithoutProductsInputSchema } from './BrandUncheckedCreateWithoutProductsInputSchema';

export const BrandCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutProductsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutProductsInputSchema;
