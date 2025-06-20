import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutManufacturedProductsInputSchema } from './BrandCreateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedCreateWithoutManufacturedProductsInputSchema } from './BrandUncheckedCreateWithoutManufacturedProductsInputSchema';
import { BrandCreateOrConnectWithoutManufacturedProductsInputSchema } from './BrandCreateOrConnectWithoutManufacturedProductsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandUncheckedCreateNestedManyWithoutManufacturedProductsInputSchema: z.ZodType<Prisma.BrandUncheckedCreateNestedManyWithoutManufacturedProductsInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema).array(),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BrandCreateOrConnectWithoutManufacturedProductsInputSchema),z.lazy(() => BrandCreateOrConnectWithoutManufacturedProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default BrandUncheckedCreateNestedManyWithoutManufacturedProductsInputSchema;
