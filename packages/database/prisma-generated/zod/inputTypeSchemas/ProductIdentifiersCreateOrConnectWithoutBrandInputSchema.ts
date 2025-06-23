import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersCreateWithoutBrandInputSchema } from './ProductIdentifiersCreateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateWithoutBrandInputSchema';

export const ProductIdentifiersCreateOrConnectWithoutBrandInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateOrConnectWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersCreateOrConnectWithoutBrandInputSchema;
