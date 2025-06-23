import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutChildrenInputSchema } from './ProductCategoryCreateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedCreateWithoutChildrenInputSchema } from './ProductCategoryUncheckedCreateWithoutChildrenInputSchema';
import { ProductCategoryCreateOrConnectWithoutChildrenInputSchema } from './ProductCategoryCreateOrConnectWithoutChildrenInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCategoryCreateNestedOneWithoutChildrenInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutChildrenInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutChildrenInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => ProductCategoryCreateOrConnectWithoutChildrenInputSchema)
        .optional(),
      connect: z.lazy(() => ProductCategoryWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCategoryCreateNestedOneWithoutChildrenInputSchema;
