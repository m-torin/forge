import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutDeletedByInputSchema } from './ProductCreateWithoutDeletedByInputSchema';
import { ProductUncheckedCreateWithoutDeletedByInputSchema } from './ProductUncheckedCreateWithoutDeletedByInputSchema';
import { ProductCreateOrConnectWithoutDeletedByInputSchema } from './ProductCreateOrConnectWithoutDeletedByInputSchema';
import { ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { ProductCreateManyDeletedByInputEnvelopeSchema } from './ProductCreateManyDeletedByInputEnvelopeSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { ProductUpdateManyWithWhereWithoutDeletedByInputSchema } from './ProductUpdateManyWithWhereWithoutDeletedByInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutDeletedByInputSchema),z.lazy(() => ProductCreateWithoutDeletedByInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => ProductCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
