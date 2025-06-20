import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutJrFindReplaceRejectsInputSchema } from './CastCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';

export const CastUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.CastUpdateManyWithoutJrFindReplaceRejectsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CastScalarWhereInputSchema),z.lazy(() => CastScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CastUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
