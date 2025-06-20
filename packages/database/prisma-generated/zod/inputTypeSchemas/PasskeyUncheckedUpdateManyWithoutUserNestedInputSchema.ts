import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyCreateWithoutUserInputSchema } from './PasskeyCreateWithoutUserInputSchema';
import { PasskeyUncheckedCreateWithoutUserInputSchema } from './PasskeyUncheckedCreateWithoutUserInputSchema';
import { PasskeyCreateOrConnectWithoutUserInputSchema } from './PasskeyCreateOrConnectWithoutUserInputSchema';
import { PasskeyUpsertWithWhereUniqueWithoutUserInputSchema } from './PasskeyUpsertWithWhereUniqueWithoutUserInputSchema';
import { PasskeyCreateManyUserInputEnvelopeSchema } from './PasskeyCreateManyUserInputEnvelopeSchema';
import { PasskeyWhereUniqueInputSchema } from './PasskeyWhereUniqueInputSchema';
import { PasskeyUpdateWithWhereUniqueWithoutUserInputSchema } from './PasskeyUpdateWithWhereUniqueWithoutUserInputSchema';
import { PasskeyUpdateManyWithWhereWithoutUserInputSchema } from './PasskeyUpdateManyWithWhereWithoutUserInputSchema';
import { PasskeyScalarWhereInputSchema } from './PasskeyScalarWhereInputSchema';

export const PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.PasskeyUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PasskeyWhereUniqueInputSchema),z.lazy(() => PasskeyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => PasskeyUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => PasskeyUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PasskeyScalarWhereInputSchema),z.lazy(() => PasskeyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema;
