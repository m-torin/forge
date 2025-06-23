import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutDeletedByInputSchema } from './ProductCategoryCreateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedCreateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedCreateWithoutDeletedByInputSchema';
import { ProductCategoryCreateOrConnectWithoutDeletedByInputSchema } from './ProductCategoryCreateOrConnectWithoutDeletedByInputSchema';
import { ProductCategoryCreateManyDeletedByInputEnvelopeSchema } from './ProductCategoryCreateManyDeletedByInputEnvelopeSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCategoryCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductCategoryCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInputSchema;
