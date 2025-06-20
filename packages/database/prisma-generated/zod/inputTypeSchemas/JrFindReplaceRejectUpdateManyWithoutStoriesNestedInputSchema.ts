import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUpdateManyWithoutStoriesNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithoutStoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUpdateManyWithoutStoriesNestedInputSchema;
