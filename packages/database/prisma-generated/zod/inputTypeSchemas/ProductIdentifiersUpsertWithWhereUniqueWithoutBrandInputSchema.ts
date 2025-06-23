import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutBrandInputSchema } from './ProductIdentifiersUpdateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema';
import { ProductIdentifiersCreateWithoutBrandInputSchema } from './ProductIdentifiersCreateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateWithoutBrandInputSchema';

export const ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductIdentifiersUpdateWithoutBrandInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutBrandInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema;
