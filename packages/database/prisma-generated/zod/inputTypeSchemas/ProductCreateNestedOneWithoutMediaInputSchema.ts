import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutMediaInputSchema } from './ProductCreateWithoutMediaInputSchema';
import { ProductUncheckedCreateWithoutMediaInputSchema } from './ProductUncheckedCreateWithoutMediaInputSchema';
import { ProductCreateOrConnectWithoutMediaInputSchema } from './ProductCreateOrConnectWithoutMediaInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutMediaInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutMediaInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutMediaInputSchema).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
    })
    .strict();

export default ProductCreateNestedOneWithoutMediaInputSchema;
