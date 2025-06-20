import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';

export const FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FandomScalarWhereInputSchema),z.lazy(() => FandomScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
