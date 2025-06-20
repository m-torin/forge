import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithoutCollectionInputSchema } from './ProductIdentifiersUpdateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema';
import { ProductIdentifiersCreateWithoutCollectionInputSchema } from './ProductIdentifiersCreateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema';

export const ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInput> = z.object({
  where: z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductIdentifiersUpdateWithoutCollectionInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateWithoutCollectionInputSchema) ]),
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema) ]),
}).strict();

export default ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema;
