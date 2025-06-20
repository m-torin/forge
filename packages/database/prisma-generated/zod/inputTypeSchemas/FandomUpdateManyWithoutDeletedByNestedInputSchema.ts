import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutDeletedByInputSchema } from './FandomCreateWithoutDeletedByInputSchema';
import { FandomUncheckedCreateWithoutDeletedByInputSchema } from './FandomUncheckedCreateWithoutDeletedByInputSchema';
import { FandomCreateOrConnectWithoutDeletedByInputSchema } from './FandomCreateOrConnectWithoutDeletedByInputSchema';
import { FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { FandomCreateManyDeletedByInputEnvelopeSchema } from './FandomCreateManyDeletedByInputEnvelopeSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { FandomUpdateManyWithWhereWithoutDeletedByInputSchema } from './FandomUpdateManyWithWhereWithoutDeletedByInputSchema';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';

export const FandomUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.FandomUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutDeletedByInputSchema),z.lazy(() => FandomCreateWithoutDeletedByInputSchema).array(),z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FandomCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => FandomCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FandomCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FandomUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => FandomUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FandomScalarWhereInputSchema),z.lazy(() => FandomScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default FandomUpdateManyWithoutDeletedByNestedInputSchema;
