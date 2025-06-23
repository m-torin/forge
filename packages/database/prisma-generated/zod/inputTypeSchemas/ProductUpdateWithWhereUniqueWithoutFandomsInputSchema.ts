import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutFandomsInputSchema } from './ProductUpdateWithoutFandomsInputSchema';
import { ProductUncheckedUpdateWithoutFandomsInputSchema } from './ProductUncheckedUpdateWithoutFandomsInputSchema';

export const ProductUpdateWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutFandomsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateWithWhereUniqueWithoutFandomsInputSchema;
