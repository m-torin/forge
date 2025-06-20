import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutProductsInputSchema } from './TaxonomyCreateWithoutProductsInputSchema';
import { TaxonomyUncheckedCreateWithoutProductsInputSchema } from './TaxonomyUncheckedCreateWithoutProductsInputSchema';
import { TaxonomyCreateOrConnectWithoutProductsInputSchema } from './TaxonomyCreateOrConnectWithoutProductsInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutProductsInputSchema } from './TaxonomyUpdateManyWithWhereWithoutProductsInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutProductsInputSchema),z.lazy(() => TaxonomyCreateWithoutProductsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutProductsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaxonomyUpdateManyWithWhereWithoutProductsInputSchema),z.lazy(() => TaxonomyUpdateManyWithWhereWithoutProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUpdateManyWithoutProductsNestedInputSchema;
