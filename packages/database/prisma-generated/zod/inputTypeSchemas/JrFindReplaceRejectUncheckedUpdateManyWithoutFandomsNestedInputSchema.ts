import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutFandomsInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutFandomsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutFandomsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutFandomsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUncheckedUpdateManyWithoutFandomsNestedInputSchema;
