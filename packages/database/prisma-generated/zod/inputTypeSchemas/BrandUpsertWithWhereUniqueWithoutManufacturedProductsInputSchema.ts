import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutManufacturedProductsInputSchema } from './BrandUpdateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedUpdateWithoutManufacturedProductsInputSchema } from './BrandUncheckedUpdateWithoutManufacturedProductsInputSchema';
import { BrandCreateWithoutManufacturedProductsInputSchema } from './BrandCreateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedCreateWithoutManufacturedProductsInputSchema } from './BrandUncheckedCreateWithoutManufacturedProductsInputSchema';

export const BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema: z.ZodType<Prisma.BrandUpsertWithWhereUniqueWithoutManufacturedProductsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BrandUpdateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutManufacturedProductsInputSchema) ]),
  create: z.union([ z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema) ]),
}).strict();

export default BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema;
