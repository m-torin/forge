import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutChildrenInputSchema } from './BrandCreateWithoutChildrenInputSchema';
import { BrandUncheckedCreateWithoutChildrenInputSchema } from './BrandUncheckedCreateWithoutChildrenInputSchema';

export const BrandCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutChildrenInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutChildrenInputSchema),z.lazy(() => BrandUncheckedCreateWithoutChildrenInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutChildrenInputSchema;
