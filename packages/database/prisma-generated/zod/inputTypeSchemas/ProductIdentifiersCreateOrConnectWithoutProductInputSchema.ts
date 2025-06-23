import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersCreateWithoutProductInputSchema } from './ProductIdentifiersCreateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutProductInputSchema } from './ProductIdentifiersUncheckedCreateWithoutProductInputSchema';

export const ProductIdentifiersCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateOrConnectWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersCreateOrConnectWithoutProductInputSchema;
