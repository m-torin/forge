import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutParentInputSchema } from './ProductCreateWithoutParentInputSchema';
import { ProductUncheckedCreateWithoutParentInputSchema } from './ProductUncheckedCreateWithoutParentInputSchema';
import { ProductCreateOrConnectWithoutParentInputSchema } from './ProductCreateOrConnectWithoutParentInputSchema';
import { ProductUpsertWithWhereUniqueWithoutParentInputSchema } from './ProductUpsertWithWhereUniqueWithoutParentInputSchema';
import { ProductCreateManyParentInputEnvelopeSchema } from './ProductCreateManyParentInputEnvelopeSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutParentInputSchema } from './ProductUpdateWithWhereUniqueWithoutParentInputSchema';
import { ProductUpdateManyWithWhereWithoutParentInputSchema } from './ProductUpdateManyWithWhereWithoutParentInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutParentNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutParentInputSchema),z.lazy(() => ProductCreateWithoutParentInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema),z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutParentInputSchema),z.lazy(() => ProductCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutParentInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutParentInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutParentInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUncheckedUpdateManyWithoutParentNestedInputSchema;
