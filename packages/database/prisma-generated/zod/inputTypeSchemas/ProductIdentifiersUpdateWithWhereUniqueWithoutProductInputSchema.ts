import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutProductInputSchema } from './ProductIdentifiersUpdateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutProductInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutProductInputSchema';

export const ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductIdentifiersUpdateWithoutProductInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema;
