import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutChildrenInputSchema } from './ProductCategoryCreateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedCreateWithoutChildrenInputSchema } from './ProductCategoryUncheckedCreateWithoutChildrenInputSchema';

export const ProductCategoryCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutChildrenInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutChildrenInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutChildrenInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryCreateOrConnectWithoutChildrenInputSchema;
