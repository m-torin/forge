import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyCreateWithoutUserInputSchema } from './ApiKeyCreateWithoutUserInputSchema';
import { ApiKeyUncheckedCreateWithoutUserInputSchema } from './ApiKeyUncheckedCreateWithoutUserInputSchema';
import { ApiKeyCreateOrConnectWithoutUserInputSchema } from './ApiKeyCreateOrConnectWithoutUserInputSchema';
import { ApiKeyCreateManyUserInputEnvelopeSchema } from './ApiKeyCreateManyUserInputEnvelopeSchema';
import { ApiKeyWhereUniqueInputSchema } from './ApiKeyWhereUniqueInputSchema';

export const ApiKeyUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ApiKeyUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ApiKeyCreateWithoutUserInputSchema),z.lazy(() => ApiKeyCreateWithoutUserInputSchema).array(),z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema),z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ApiKeyCreateOrConnectWithoutUserInputSchema),z.lazy(() => ApiKeyCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ApiKeyCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ApiKeyWhereUniqueInputSchema),z.lazy(() => ApiKeyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ApiKeyUncheckedCreateNestedManyWithoutUserInputSchema;
