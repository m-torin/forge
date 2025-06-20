import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutBrandInputSchema } from './ProductIdentifiersCreateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateWithoutBrandInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutBrandInputSchema } from './ProductIdentifiersCreateOrConnectWithoutBrandInputSchema';
import { ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema } from './ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema';
import { ProductIdentifiersCreateManyBrandInputEnvelopeSchema } from './ProductIdentifiersCreateManyBrandInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema } from './ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema';
import { ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema } from './ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';

export const ProductIdentifiersUncheckedUpdateManyWithoutBrandNestedInputSchema: z.ZodType<Prisma.ProductIdentifiersUncheckedUpdateManyWithoutBrandNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema).array(),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductIdentifiersCreateOrConnectWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersCreateOrConnectWithoutBrandInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutBrandInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductIdentifiersCreateManyBrandInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutBrandInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductIdentifiersScalarWhereInputSchema),z.lazy(() => ProductIdentifiersScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductIdentifiersUncheckedUpdateManyWithoutBrandNestedInputSchema;
