import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutPdpJoinInputSchema } from './ProductIdentifiersUpdateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema';

export const ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductIdentifiersUpdateWithoutPdpJoinInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema;
