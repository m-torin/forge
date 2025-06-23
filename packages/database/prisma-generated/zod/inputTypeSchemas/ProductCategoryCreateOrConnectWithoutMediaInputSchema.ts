import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryCreateWithoutMediaInputSchema } from './ProductCategoryCreateWithoutMediaInputSchema';
import { ProductCategoryUncheckedCreateWithoutMediaInputSchema } from './ProductCategoryUncheckedCreateWithoutMediaInputSchema';

export const ProductCategoryCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.ProductCategoryCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => ProductCategoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductCategoryCreateWithoutMediaInputSchema),
        z.lazy(() => ProductCategoryUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default ProductCategoryCreateOrConnectWithoutMediaInputSchema;
