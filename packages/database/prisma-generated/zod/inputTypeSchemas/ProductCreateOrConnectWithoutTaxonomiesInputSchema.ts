import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutTaxonomiesInputSchema } from './ProductCreateWithoutTaxonomiesInputSchema';
import { ProductUncheckedCreateWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateWithoutTaxonomiesInputSchema';

export const ProductCreateOrConnectWithoutTaxonomiesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutTaxonomiesInputSchema;
