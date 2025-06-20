import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyCreateWithoutUserInputSchema } from './ApiKeyCreateWithoutUserInputSchema';
import { ApiKeyUncheckedCreateWithoutUserInputSchema } from './ApiKeyUncheckedCreateWithoutUserInputSchema';
import { ApiKeyCreateOrConnectWithoutUserInputSchema } from './ApiKeyCreateOrConnectWithoutUserInputSchema';
import { ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema } from './ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema';
import { ApiKeyCreateManyUserInputEnvelopeSchema } from './ApiKeyCreateManyUserInputEnvelopeSchema';
import { ApiKeyWhereUniqueInputSchema } from './ApiKeyWhereUniqueInputSchema';
import { ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema } from './ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema';
import { ApiKeyUpdateManyWithWhereWithoutUserInputSchema } from './ApiKeyUpdateManyWithWhereWithoutUserInputSchema';
import { ApiKeyScalarWhereInputSchema } from './ApiKeyScalarWhereInputSchema';

export const ApiKeyUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ApiKeyUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ApiKeyCreateWithoutUserInputSchema),z.lazy(() => ApiKeyCreateWithoutUserInputSchema).array(),z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ApiKeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => ApiKeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ApiKeyUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ApiKeyCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ApiKeyWhereUniqueInputSchema),z.lazy(() => ApiKeyWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ApiKeyWhereUniqueInputSchema),z.lazy(() => ApiKeyWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ApiKeyWhereUniqueInputSchema),z.lazy(() => ApiKeyWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ApiKeyWhereUniqueInputSchema),z.lazy(() => ApiKeyWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ApiKeyUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ApiKeyUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ApiKeyScalarWhereInputSchema),z.lazy(() => ApiKeyScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ApiKeyUncheckedUpdateManyWithoutUserNestedInputSchema;
