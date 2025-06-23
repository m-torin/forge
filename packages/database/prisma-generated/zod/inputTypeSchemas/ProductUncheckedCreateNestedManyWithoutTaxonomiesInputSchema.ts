import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutTaxonomiesInputSchema } from './ProductCreateWithoutTaxonomiesInputSchema';
import { ProductUncheckedCreateWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateWithoutTaxonomiesInputSchema';
import { ProductCreateOrConnectWithoutTaxonomiesInputSchema } from './ProductCreateOrConnectWithoutTaxonomiesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutTaxonomiesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutTaxonomiesInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutTaxonomiesInputSchema).array(),
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

export default ProductUncheckedCreateNestedManyWithoutTaxonomiesInputSchema;
