import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutParentInputSchema } from './ProductCategoryCreateWithoutParentInputSchema';
import { ProductCategoryUncheckedCreateWithoutParentInputSchema } from './ProductCategoryUncheckedCreateWithoutParentInputSchema';
import { ProductCategoryCreateOrConnectWithoutParentInputSchema } from './ProductCategoryCreateOrConnectWithoutParentInputSchema';
import { ProductCategoryCreateManyParentInputEnvelopeSchema } from './ProductCategoryCreateManyParentInputEnvelopeSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.ProductCategoryCreateNestedManyWithoutParentInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutParentInputSchema),
          z.lazy(() => ProductCategoryCreateWithoutParentInputSchema).array(),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCategoryCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => ProductCategoryCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductCategoryCreateManyParentInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductCategoryCreateNestedManyWithoutParentInputSchema;
