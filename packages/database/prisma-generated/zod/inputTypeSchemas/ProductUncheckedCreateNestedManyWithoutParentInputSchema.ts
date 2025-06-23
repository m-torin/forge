import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutParentInputSchema } from './ProductCreateWithoutParentInputSchema';
import { ProductUncheckedCreateWithoutParentInputSchema } from './ProductUncheckedCreateWithoutParentInputSchema';
import { ProductCreateOrConnectWithoutParentInputSchema } from './ProductCreateOrConnectWithoutParentInputSchema';
import { ProductCreateManyParentInputEnvelopeSchema } from './ProductCreateManyParentInputEnvelopeSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutParentInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutParentInputSchema),
          z.lazy(() => ProductCreateWithoutParentInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductCreateManyParentInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductUncheckedCreateNestedManyWithoutParentInputSchema;
