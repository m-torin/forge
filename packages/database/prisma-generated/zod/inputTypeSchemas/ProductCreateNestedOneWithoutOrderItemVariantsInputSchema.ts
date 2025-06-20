import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutOrderItemVariantsInputSchema } from './ProductCreateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedCreateWithoutOrderItemVariantsInputSchema';
import { ProductCreateOrConnectWithoutOrderItemVariantsInputSchema } from './ProductCreateOrConnectWithoutOrderItemVariantsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutOrderItemVariantsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutOrderItemVariantsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutOrderItemVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutOrderItemVariantsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutOrderItemVariantsInputSchema;
