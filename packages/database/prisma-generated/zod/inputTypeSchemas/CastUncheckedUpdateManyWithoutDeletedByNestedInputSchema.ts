import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutDeletedByInputSchema } from './CastCreateWithoutDeletedByInputSchema';
import { CastUncheckedCreateWithoutDeletedByInputSchema } from './CastUncheckedCreateWithoutDeletedByInputSchema';
import { CastCreateOrConnectWithoutDeletedByInputSchema } from './CastCreateOrConnectWithoutDeletedByInputSchema';
import { CastUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './CastUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { CastCreateManyDeletedByInputEnvelopeSchema } from './CastCreateManyDeletedByInputEnvelopeSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './CastUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { CastUpdateManyWithWhereWithoutDeletedByInputSchema } from './CastUpdateManyWithWhereWithoutDeletedByInputSchema';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';

export const CastUncheckedUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.CastUncheckedUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => CastCreateWithoutDeletedByInputSchema),z.lazy(() => CastCreateWithoutDeletedByInputSchema).array(),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CastCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => CastCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CastUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => CastUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CastCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CastUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => CastUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CastUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => CastUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CastScalarWhereInputSchema),z.lazy(() => CastScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CastUncheckedUpdateManyWithoutDeletedByNestedInputSchema;
