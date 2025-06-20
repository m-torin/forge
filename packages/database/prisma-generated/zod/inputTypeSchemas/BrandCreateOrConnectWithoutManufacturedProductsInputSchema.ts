import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutManufacturedProductsInputSchema } from './BrandCreateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedCreateWithoutManufacturedProductsInputSchema } from './BrandUncheckedCreateWithoutManufacturedProductsInputSchema';

export const BrandCreateOrConnectWithoutManufacturedProductsInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutManufacturedProductsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutManufacturedProductsInputSchema;
