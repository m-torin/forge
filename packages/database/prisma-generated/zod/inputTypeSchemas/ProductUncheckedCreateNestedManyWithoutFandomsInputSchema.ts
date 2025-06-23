import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutFandomsInputSchema } from './ProductCreateWithoutFandomsInputSchema';
import { ProductUncheckedCreateWithoutFandomsInputSchema } from './ProductUncheckedCreateWithoutFandomsInputSchema';
import { ProductCreateOrConnectWithoutFandomsInputSchema } from './ProductCreateOrConnectWithoutFandomsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutFandomsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutFandomsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutFandomsInputSchema),
          z.lazy(() => ProductCreateWithoutFandomsInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutFandomsInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutFandomsInputSchema).array(),
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

export default ProductUncheckedCreateNestedManyWithoutFandomsInputSchema;
