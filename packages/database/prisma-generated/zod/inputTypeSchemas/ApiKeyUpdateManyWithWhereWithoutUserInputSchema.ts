import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyScalarWhereInputSchema } from './ApiKeyScalarWhereInputSchema';
import { ApiKeyUpdateManyMutationInputSchema } from './ApiKeyUpdateManyMutationInputSchema';
import { ApiKeyUncheckedUpdateManyWithoutUserInputSchema } from './ApiKeyUncheckedUpdateManyWithoutUserInputSchema';

export const ApiKeyUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ApiKeyUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ApiKeyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ApiKeyUpdateManyMutationInputSchema),z.lazy(() => ApiKeyUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ApiKeyUpdateManyWithWhereWithoutUserInputSchema;
