import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateWithoutRegistryInputSchema } from './RegistryUserJoinCreateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema';
import { RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema } from './RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema';
import { RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema } from './RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema';
import { RegistryUserJoinCreateManyRegistryInputEnvelopeSchema } from './RegistryUserJoinCreateManyRegistryInputEnvelopeSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema } from './RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema';
import { RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema } from './RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema';
import { RegistryUserJoinScalarWhereInputSchema } from './RegistryUserJoinScalarWhereInputSchema';

export const RegistryUserJoinUpdateManyWithoutRegistryNestedInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateManyWithoutRegistryNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema).array(),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryUserJoinCreateManyRegistryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryUserJoinScalarWhereInputSchema),z.lazy(() => RegistryUserJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryUserJoinUpdateManyWithoutRegistryNestedInputSchema;
