import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutChildrenInputSchema } from './BrandCreateWithoutChildrenInputSchema';
import { BrandUncheckedCreateWithoutChildrenInputSchema } from './BrandUncheckedCreateWithoutChildrenInputSchema';
import { BrandCreateOrConnectWithoutChildrenInputSchema } from './BrandCreateOrConnectWithoutChildrenInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.BrandCreateNestedOneWithoutChildrenInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutChildrenInputSchema),z.lazy(() => BrandUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutChildrenInputSchema).optional(),
  connect: z.lazy(() => BrandWhereUniqueInputSchema).optional()
}).strict();

export default BrandCreateNestedOneWithoutChildrenInputSchema;
