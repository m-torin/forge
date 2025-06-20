import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutRegistriesInputSchema } from './ProductCreateWithoutRegistriesInputSchema';
import { ProductUncheckedCreateWithoutRegistriesInputSchema } from './ProductUncheckedCreateWithoutRegistriesInputSchema';
import { ProductCreateOrConnectWithoutRegistriesInputSchema } from './ProductCreateOrConnectWithoutRegistriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutRegistriesInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutRegistriesInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutRegistriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRegistriesInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutRegistriesInputSchema;
