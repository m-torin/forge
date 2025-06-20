import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyWhereUniqueInputSchema } from './ApiKeyWhereUniqueInputSchema';
import { ApiKeyCreateWithoutUserInputSchema } from './ApiKeyCreateWithoutUserInputSchema';
import { ApiKeyUncheckedCreateWithoutUserInputSchema } from './ApiKeyUncheckedCreateWithoutUserInputSchema';

export const ApiKeyCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ApiKeyCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ApiKeyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ApiKeyCreateWithoutUserInputSchema),z.lazy(() => ApiKeyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ApiKeyCreateOrConnectWithoutUserInputSchema;
