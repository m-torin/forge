import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutFandomsInputSchema } from './ProductCreateWithoutFandomsInputSchema';
import { ProductUncheckedCreateWithoutFandomsInputSchema } from './ProductUncheckedCreateWithoutFandomsInputSchema';
import { ProductCreateOrConnectWithoutFandomsInputSchema } from './ProductCreateOrConnectWithoutFandomsInputSchema';
import { ProductUpsertWithWhereUniqueWithoutFandomsInputSchema } from './ProductUpsertWithWhereUniqueWithoutFandomsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutFandomsInputSchema } from './ProductUpdateWithWhereUniqueWithoutFandomsInputSchema';
import { ProductUpdateManyWithWhereWithoutFandomsInputSchema } from './ProductUpdateManyWithWhereWithoutFandomsInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutFandomsNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutFandomsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutFandomsInputSchema),z.lazy(() => ProductCreateWithoutFandomsInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFandomsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutFandomsInputSchema),z.lazy(() => ProductCreateOrConnectWithoutFandomsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutFandomsInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutFandomsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUncheckedUpdateManyWithoutFandomsNestedInputSchema;
