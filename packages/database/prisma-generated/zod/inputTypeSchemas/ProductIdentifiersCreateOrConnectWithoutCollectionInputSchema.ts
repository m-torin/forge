import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersCreateWithoutCollectionInputSchema } from './ProductIdentifiersCreateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema';

export const ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateOrConnectWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema;
