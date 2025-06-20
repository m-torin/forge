import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberCreateWithoutUserInputSchema } from './MemberCreateWithoutUserInputSchema';
import { MemberUncheckedCreateWithoutUserInputSchema } from './MemberUncheckedCreateWithoutUserInputSchema';
import { MemberCreateOrConnectWithoutUserInputSchema } from './MemberCreateOrConnectWithoutUserInputSchema';
import { MemberUpsertWithWhereUniqueWithoutUserInputSchema } from './MemberUpsertWithWhereUniqueWithoutUserInputSchema';
import { MemberCreateManyUserInputEnvelopeSchema } from './MemberCreateManyUserInputEnvelopeSchema';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithWhereUniqueWithoutUserInputSchema } from './MemberUpdateWithWhereUniqueWithoutUserInputSchema';
import { MemberUpdateManyWithWhereWithoutUserInputSchema } from './MemberUpdateManyWithWhereWithoutUserInputSchema';
import { MemberScalarWhereInputSchema } from './MemberScalarWhereInputSchema';

export const MemberUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MemberUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutUserInputSchema),z.lazy(() => MemberCreateWithoutUserInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema),z.lazy(() => MemberCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => MemberUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => MemberUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => MemberScalarWhereInputSchema),z.lazy(() => MemberScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default MemberUpdateManyWithoutUserNestedInputSchema;
