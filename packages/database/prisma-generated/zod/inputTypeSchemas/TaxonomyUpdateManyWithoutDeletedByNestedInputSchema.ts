import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutDeletedByInputSchema } from './TaxonomyCreateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedCreateWithoutDeletedByInputSchema } from './TaxonomyUncheckedCreateWithoutDeletedByInputSchema';
import { TaxonomyCreateOrConnectWithoutDeletedByInputSchema } from './TaxonomyCreateOrConnectWithoutDeletedByInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { TaxonomyCreateManyDeletedByInputEnvelopeSchema } from './TaxonomyCreateManyDeletedByInputEnvelopeSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema } from './TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema),z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TaxonomyCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TaxonomyScalarWhereInputSchema),z.lazy(() => TaxonomyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUpdateManyWithoutDeletedByNestedInputSchema;
