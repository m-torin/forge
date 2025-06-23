import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutIdentifiersInputSchema } from './ProductCreateWithoutIdentifiersInputSchema';
import { ProductUncheckedCreateWithoutIdentifiersInputSchema } from './ProductUncheckedCreateWithoutIdentifiersInputSchema';
import { ProductCreateOrConnectWithoutIdentifiersInputSchema } from './ProductCreateOrConnectWithoutIdentifiersInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutIdentifiersInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutIdentifiersInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutIdentifiersInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutIdentifiersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutIdentifiersInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutIdentifiersInputSchema;
