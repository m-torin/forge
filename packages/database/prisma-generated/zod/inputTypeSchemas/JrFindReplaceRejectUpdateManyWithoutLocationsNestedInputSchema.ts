import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUpdateManyWithoutLocationsNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithoutLocationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutLocationsInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema),z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutLocationsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUpdateManyWithoutLocationsNestedInputSchema;
