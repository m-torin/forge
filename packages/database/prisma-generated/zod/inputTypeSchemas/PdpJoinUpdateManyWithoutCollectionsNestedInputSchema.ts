import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutCollectionsInputSchema } from './PdpJoinCreateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedCreateWithoutCollectionsInputSchema } from './PdpJoinUncheckedCreateWithoutCollectionsInputSchema';
import { PdpJoinCreateOrConnectWithoutCollectionsInputSchema } from './PdpJoinCreateOrConnectWithoutCollectionsInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema } from './PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUpdateManyWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithoutCollectionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema),z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PdpJoinScalarWhereInputSchema),z.lazy(() => PdpJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinUpdateManyWithoutCollectionsNestedInputSchema;
