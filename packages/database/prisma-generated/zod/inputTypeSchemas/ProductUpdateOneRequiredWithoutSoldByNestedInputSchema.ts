import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutSoldByInputSchema } from './ProductCreateWithoutSoldByInputSchema';
import { ProductUncheckedCreateWithoutSoldByInputSchema } from './ProductUncheckedCreateWithoutSoldByInputSchema';
import { ProductCreateOrConnectWithoutSoldByInputSchema } from './ProductCreateOrConnectWithoutSoldByInputSchema';
import { ProductUpsertWithoutSoldByInputSchema } from './ProductUpsertWithoutSoldByInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutSoldByInputSchema } from './ProductUpdateToOneWithWhereWithoutSoldByInputSchema';
import { ProductUpdateWithoutSoldByInputSchema } from './ProductUpdateWithoutSoldByInputSchema';
import { ProductUncheckedUpdateWithoutSoldByInputSchema } from './ProductUncheckedUpdateWithoutSoldByInputSchema';

export const ProductUpdateOneRequiredWithoutSoldByNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutSoldByNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutSoldByInputSchema),z.lazy(() => ProductUncheckedCreateWithoutSoldByInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutSoldByInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutSoldByInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutSoldByInputSchema),z.lazy(() => ProductUpdateWithoutSoldByInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutSoldByInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneRequiredWithoutSoldByNestedInputSchema;
