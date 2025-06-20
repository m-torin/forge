import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutTaxonomiesInputSchema } from './ProductCreateWithoutTaxonomiesInputSchema';
import { ProductUncheckedCreateWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateWithoutTaxonomiesInputSchema';
import { ProductCreateOrConnectWithoutTaxonomiesInputSchema } from './ProductCreateOrConnectWithoutTaxonomiesInputSchema';
import { ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema } from './ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema } from './ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema';
import { ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema } from './ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUpdateManyWithoutTaxonomiesNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutTaxonomiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema),z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => ProductCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUpdateManyWithoutTaxonomiesNestedInputSchema;
