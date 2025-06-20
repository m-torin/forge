import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateWithoutUserInputSchema } from './RegistryUserJoinCreateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutUserInputSchema } from './RegistryUserJoinUncheckedCreateWithoutUserInputSchema';
import { RegistryUserJoinCreateOrConnectWithoutUserInputSchema } from './RegistryUserJoinCreateOrConnectWithoutUserInputSchema';
import { RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema } from './RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema';
import { RegistryUserJoinCreateManyUserInputEnvelopeSchema } from './RegistryUserJoinCreateManyUserInputEnvelopeSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema } from './RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema';
import { RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema } from './RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema';
import { RegistryUserJoinScalarWhereInputSchema } from './RegistryUserJoinScalarWhereInputSchema';

export const RegistryUserJoinUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema),z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema).array(),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryUserJoinCreateOrConnectWithoutUserInputSchema),z.lazy(() => RegistryUserJoinCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryUserJoinCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryUserJoinScalarWhereInputSchema),z.lazy(() => RegistryUserJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryUserJoinUpdateManyWithoutUserNestedInputSchema;
