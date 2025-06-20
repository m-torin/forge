import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutCollectionsInputSchema } from './TaxonomyCreateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedCreateWithoutCollectionsInputSchema } from './TaxonomyUncheckedCreateWithoutCollectionsInputSchema';
import { TaxonomyCreateOrConnectWithoutCollectionsInputSchema } from './TaxonomyCreateOrConnectWithoutCollectionsInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema } from './TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUpdateManyWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithoutCollectionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema),z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUpdateManyWithWhereWithoutCollectionsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUpdateManyWithoutCollectionsNestedInputSchema;
