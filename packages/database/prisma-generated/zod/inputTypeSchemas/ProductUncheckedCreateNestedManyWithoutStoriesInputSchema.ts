import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutStoriesInputSchema } from './ProductCreateWithoutStoriesInputSchema';
import { ProductUncheckedCreateWithoutStoriesInputSchema } from './ProductUncheckedCreateWithoutStoriesInputSchema';
import { ProductCreateOrConnectWithoutStoriesInputSchema } from './ProductCreateOrConnectWithoutStoriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutStoriesInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutStoriesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutStoriesInputSchema),
          z.lazy(() => ProductCreateWithoutStoriesInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutStoriesInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutStoriesInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductUncheckedCreateNestedManyWithoutStoriesInputSchema;
