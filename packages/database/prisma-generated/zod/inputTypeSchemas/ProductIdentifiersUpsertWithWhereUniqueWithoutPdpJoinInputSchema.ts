import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutPdpJoinInputSchema } from './ProductIdentifiersUpdateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema';
import { ProductIdentifiersCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema';

export const ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductIdentifiersUpdateWithoutPdpJoinInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutPdpJoinInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema;
