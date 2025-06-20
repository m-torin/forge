import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyWhereUniqueInputSchema } from './ApiKeyWhereUniqueInputSchema';
import { ApiKeyUpdateWithoutUserInputSchema } from './ApiKeyUpdateWithoutUserInputSchema';
import { ApiKeyUncheckedUpdateWithoutUserInputSchema } from './ApiKeyUncheckedUpdateWithoutUserInputSchema';

export const ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ApiKeyUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ApiKeyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ApiKeyUpdateWithoutUserInputSchema),z.lazy(() => ApiKeyUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ApiKeyUpdateWithWhereUniqueWithoutUserInputSchema;
