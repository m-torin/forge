import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutCollectionInputSchema } from './ProductIdentifiersUpdateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema';

export const ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductIdentifiersUpdateWithoutCollectionInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema;
