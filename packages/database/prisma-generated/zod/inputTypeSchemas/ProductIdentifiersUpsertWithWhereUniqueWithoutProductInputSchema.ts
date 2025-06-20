import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutProductInputSchema } from './ProductIdentifiersUpdateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutProductInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutProductInputSchema';
import { ProductIdentifiersCreateWithoutProductInputSchema } from './ProductIdentifiersCreateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutProductInputSchema } from './ProductIdentifiersUncheckedCreateWithoutProductInputSchema';

export const ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ProductIdentifiersUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductIdentifiersUpdateWithoutProductInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema;
