import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutManufacturedProductsInputSchema } from './BrandCreateWithoutManufacturedProductsInputSchema';
import { BrandUncheckedCreateWithoutManufacturedProductsInputSchema } from './BrandUncheckedCreateWithoutManufacturedProductsInputSchema';
import { BrandCreateOrConnectWithoutManufacturedProductsInputSchema } from './BrandCreateOrConnectWithoutManufacturedProductsInputSchema';
import { BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema } from './BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema } from './BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema';
import { BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema } from './BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';

export const BrandUpdateManyWithoutManufacturedProductsNestedInputSchema: z.ZodType<Prisma.BrandUpdateManyWithoutManufacturedProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandCreateWithoutManufacturedProductsInputSchema).array(),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutManufacturedProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BrandCreateOrConnectWithoutManufacturedProductsInputSchema),z.lazy(() => BrandCreateOrConnectWithoutManufacturedProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUpsertWithWhereUniqueWithoutManufacturedProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => BrandWhereUniqueInputSchema),z.lazy(() => BrandWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUpdateWithWhereUniqueWithoutManufacturedProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema),z.lazy(() => BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => BrandScalarWhereInputSchema),z.lazy(() => BrandScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default BrandUpdateManyWithoutManufacturedProductsNestedInputSchema;
