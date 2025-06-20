import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutFandomsInputSchema } from './ProductUpdateWithoutFandomsInputSchema';
import { ProductUncheckedUpdateWithoutFandomsInputSchema } from './ProductUncheckedUpdateWithoutFandomsInputSchema';
import { ProductCreateWithoutFandomsInputSchema } from './ProductCreateWithoutFandomsInputSchema';
import { ProductUncheckedCreateWithoutFandomsInputSchema } from './ProductUncheckedCreateWithoutFandomsInputSchema';

export const ProductUpsertWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutFandomsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutFandomsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFandomsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutFandomsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema) ]),
}).strict();

export default ProductUpsertWithWhereUniqueWithoutFandomsInputSchema;
