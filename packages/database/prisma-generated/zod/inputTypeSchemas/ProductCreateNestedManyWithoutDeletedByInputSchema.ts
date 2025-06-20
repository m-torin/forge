import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutDeletedByInputSchema } from './ProductCreateWithoutDeletedByInputSchema';
import { ProductUncheckedCreateWithoutDeletedByInputSchema } from './ProductUncheckedCreateWithoutDeletedByInputSchema';
import { ProductCreateOrConnectWithoutDeletedByInputSchema } from './ProductCreateOrConnectWithoutDeletedByInputSchema';
import { ProductCreateManyDeletedByInputEnvelopeSchema } from './ProductCreateManyDeletedByInputEnvelopeSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutDeletedByInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutDeletedByInputSchema),z.lazy(() => ProductCreateWithoutDeletedByInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => ProductCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyDeletedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductCreateNestedManyWithoutDeletedByInputSchema;
