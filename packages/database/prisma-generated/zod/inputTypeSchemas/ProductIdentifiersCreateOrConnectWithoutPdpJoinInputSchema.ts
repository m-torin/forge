import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema';

export const ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateOrConnectWithoutPdpJoinInput> = z.object({
  where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema) ]),
}).strict();

export default ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema;
