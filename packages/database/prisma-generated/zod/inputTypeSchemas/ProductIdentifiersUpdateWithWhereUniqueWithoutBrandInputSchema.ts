import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutBrandInputSchema } from './ProductIdentifiersUpdateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema';

export const ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductIdentifiersUpdateWithoutBrandInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema;
